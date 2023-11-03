const ldapUtil = require('../utils/ldap.util');
const cadidbService = require('./cadidb.service');
const peopleService = require('./people.service');

const visibleConditionByCmplType = `
    (
      cmpl_type IS NULL OR cmpl_type = '' OR
      (cmpl_type NOT LIKE ('%Z%') AND cmpl_type IN ('FS', 'F', 'E', 'X', 'S'))
    )
  `;

async function get (params) {
  const lang = params.hl || 'fr';
  const q = params.q;
  const acro = params.acro;
  if (acro) {
    return await getUnit(acro, lang);
  }

  const unitList = await searchUnits(q, lang);

  if (unitList.length === 0) {
    return {};
  } else if (unitList.length === 1) {
    return await getUnit(unitList[0].acronym, lang);
  } else {
    return sortUnits(unitList, q);
  }
}

async function searchUnits (q, lang) {
  const query = 'SELECT sigle, libelle, libelle_en, hierarchie ' +
                'FROM Unites_v2 ' +
                'WHERE (sigle LIKE ? OR libelle LIKE ? OR libelle_en LIKE ?) ' +
                `AND ${visibleConditionByCmplType}` +
                'AND hierarchie NOT LIKE ?';
  const values = ['%' + q + '%', '%' + q + '%', '%' + q + '%', 'TECHNIQUE%'];

  const results = await cadidbService.sendQuery(query, values, 'searchUnits');
  const formattedResults = results.map((dict) => {
    const modifiedDict = {
      acronym: dict.sigle,
      path: dict.hierarchie.split(' '),
      name: lang === 'en'
        ? (dict.libelle_en ? dict.libelle_en : dict.libelle)
        : (dict.libelle ? dict.libelle : dict.libelle_en)
    };
    return modifiedDict;
  });
  return formattedResults;
}

function score (a, qLower) {
  let points = 0;
  const acronymLower = a.acronym.toLowerCase();
  if (acronymLower === qLower) {
    points += 2;
  } else if (acronymLower.includes(qLower)) {
    points += 1;
  }
  return points;
}

function sortUnits (units, q) {
  const qLower = q.toLowerCase();
  const scoredUnits = units.map(a => ({ unit: a, score: score(a, qLower) }));
  return scoredUnits.sort((a, b) =>
    b.score - a.score ||
    a.unit.acronym.localeCompare(b.unit.acronym)
  ).map(scoredUnit => scoredUnit.unit);
}

async function getUnit (acro, lang) {
  const query = 'SELECT sigle, id_unite, libelle, libelle_en, hierarchie, ' +
                'resp_sciper, resp_nom, resp_nom_usuel, resp_prenom, ' +
                'resp_prenom_usuel, url, faxes, adresse, cmpl_type, ghost, ' +
                'has_accreds ' +
                'FROM Unites_v2 ' +
                'WHERE sigle = ? ' +
                `AND ${visibleConditionByCmplType} ` +
                'AND hierarchie NOT LIKE ?';
  const values = [acro, 'TECHNIQUE%'];

  const results = await cadidbService.sendQuery(query, values, 'getUnit');
  if (results.length !== 1) {
    return {};
  }
  const dict = results[0];
  const unitPath = await getUnitPath(dict.hierarchie, lang);
  const ldapHeadPerson = await peopleService.getPersonBySciper(
    dict.resp_sciper
  );
  const headPerson = ldapUtil.ldap2api(ldapHeadPerson, '', lang);
  const unitFullDetails = {
    code: dict.id_unite,
    acronym: dict.sigle,
    name: lang === 'en'
      ? (dict.libelle_en ? dict.libelle_en : dict.libelle)
      : (dict.libelle ? dict.libelle : dict.libelle_en),
    unitPath: dict.hierarchie,
    path: unitPath,
    terminal: dict.has_accreds,
    ghost: dict.ghost
  };
  const address = dict.adresse.split('$').map((value) => value.trim())
    .filter((value) => value !== '');
  if (address.length > 0) {
    unitFullDetails.address = address;
  }
  if (dict.resp_sciper) {
    unitFullDetails.head = {
      sciper: dict.resp_sciper,
      name: dict.resp_nom_usuel || dict.resp_nom,
      firstname: dict.resp_prenom_usuel || dict.resp_prenom,
      email: headPerson[0].email,
      profile: headPerson[0].profile
    };
  }
  if (dict.url) {
    unitFullDetails.url = dict.url;
  }
  if (dict.has_accreds) {
    // TODO: Get people from ldap

  } else {
    unitFullDetails.subunits = await getSubunits(dict.id_unite, lang);
  }
  if (dict.faxes) {
    unitFullDetails.faxes = dict.faxes.split(',').map((fax) => {
      const trimmedFax = fax.trim();
      if (trimmedFax.startsWith('0')) {
        return trimmedFax.replace(/^0(\d{2})(.*)/, '+41 $1 $2');
      } else {
        return '+41 21 69' + trimmedFax;
      }
    });
  }

  // TODO: if req.get('X-EPFL-Internal') === 'TRUE' → add `adminData`

  return unitFullDetails;
}

// Get unit path (acronym + name)
async function getUnitPath (hierarchy, lang) {
  const hierarchyArray = hierarchy.split(' ');
  const inHierarchyClause = `IN ('${hierarchyArray.join("', '")}')`;
  const query = 'SELECT sigle, libelle, libelle_en ' +
                'FROM Unites_v2 ' +
                `WHERE sigle ${inHierarchyClause}`;
  const values = [];

  const results = await cadidbService.sendQuery(query, values, 'getUnitPath');
  const formattedResults = results.map((dict) => {
    const modifiedDict = {
      acronym: dict.sigle,
      name: lang === 'en'
        ? (dict.libelle_en ? dict.libelle_en : dict.libelle)
        : (dict.libelle ? dict.libelle : dict.libelle_en)
    };
    return modifiedDict;
  });
  const hierarchyMap = {};
  hierarchyArray.forEach((value, index) => {
    hierarchyMap[value] = index;
  });
  return formattedResults.sort((a, b) => {
    return hierarchyMap[a.acronym] - hierarchyMap[b.acronym];
  });
}

// Get Subunit(s) (acronym + name)
async function getSubunits (unitId, lang) {
  const query = 'SELECT sigle, libelle, libelle_en ' +
                'FROM Unites_v2 ' +
                'WHERE id_parent = ? ' +
                `AND ${visibleConditionByCmplType}`;
  const values = [unitId];

  const results = await cadidbService.sendQuery(query, values, 'getSubunits');
  const formattedResults = results.map((dict) => {
    const modifiedDict = {
      acronym: dict.sigle,
      name: lang === 'en'
        ? (dict.libelle_en ? dict.libelle_en : dict.libelle)
        : (dict.libelle ? dict.libelle : dict.libelle_en)
    };
    return modifiedDict;
  });
  return formattedResults.sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
  get
};

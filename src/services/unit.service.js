const ldapUtil = require('../utils/ldap.util');
const apimdService = require('./apimd.service');
const cadidbService = require('./cadidb.service');
const peopleService = require('./people.service');

const unitsToShow = ['', 'FS', 'F', 'E', 'X', 'S'];
const visibleConditionByCmplType = `
    (
      cmpl_type IS NULL OR cmpl_type = '' OR
      (cmpl_type NOT LIKE ('%Z%') AND cmpl_type IN ('FS', 'F', 'E', 'X', 'S'))
    )
  `;

// cmpl_type is surprisingly insufficient for some units
const visibleConditionByHierarchy = 'hierarchie NOT LIKE \'%TECHNIQUE%\'';

async function get (params, isInternal) {
  const lang = params.hl || 'fr';
  const q = params.q;
  const acro = params.acro;
  if (acro) {
    return await getUnit(acro, lang, isInternal);
  }

  const unitList = await searchUnits(q, lang);

  if (unitList.length === 0) {
    return {};
  } else if (unitList.length === 1) {
    return await getUnit(unitList[0].acronym, lang, isInternal);
  } else {
    return sortUnits(unitList, q);
  }
}

async function searchUnits (q, lang) {
  let unitId;
  if (!isNaN(q)) {
    unitId = parseInt(q);
  }
  const query = 'SELECT sigle, libelle, libelle_en, hierarchie ' +
                'FROM Unites_v2 ' +
                'WHERE (sigle LIKE ? OR libelle LIKE ? OR ' +
                'libelle_en LIKE ? OR id_unite = ?) ' +
                `AND ${visibleConditionByCmplType}` +
                `AND ${visibleConditionByHierarchy}`;
  const values = [
    '%' + q + '%', '%' + q + '%', '%' + q + '%', unitId
  ];

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

async function getUnit (acro, lang, isInternal) {
  const query = 'SELECT sigle, id_unite, libelle, libelle_en, hierarchie, ' +
                'resp_sciper, resp_nom, resp_nom_usuel, resp_prenom, ' +
                'resp_prenom_usuel, url, faxes, adresse, cmpl_type, ghost, ' +
                'has_accreds ' +
                'FROM Unites_v2 ' +
                'WHERE sigle = ? ' +
                `AND ${visibleConditionByCmplType} ` +
                `AND ${visibleConditionByHierarchy}`;
  const values = [acro];
  let cosec = [];

  const results = await cadidbService.sendQuery(query, values, 'getUnit');
  if (results.length !== 1) {
    return {};
  }
  const dict = results[0];
  const unitPath = await getUnitPath(dict.hierarchie, lang);
  const unitFullDetails = {
    code: dict.id_unite,
    acronym: dict.sigle,
    name: lang === 'en'
      ? (dict.libelle_en ? dict.libelle_en : dict.libelle)
      : (dict.libelle ? dict.libelle : dict.libelle_en),
    unitPath: dict.hierarchie,
    path: unitPath,
    terminal: dict.has_accreds,
    ghost: dict.ghost,
    url: dict.url ? dict.url : null
  };
  const address = dict.adresse.split('$').map((value) => value.trim())
    .filter((value) => value !== '');
  unitFullDetails.address = address.length > 0 ? address : null;
  if (dict.resp_sciper) {
    unitFullDetails.head = {
      sciper: dict.resp_sciper,
      name: dict.resp_nom_usuel || dict.resp_nom,
      firstname: dict.resp_prenom_usuel || dict.resp_prenom
    };
    const ldapHeadPerson = await peopleService.getPersonBySciper(
      dict.resp_sciper
    );
    const headPerson = ldapUtil.ldap2api(ldapHeadPerson, '', lang);
    if (headPerson.length > 0) {
      unitFullDetails.head.email = headPerson[0].email
        ? headPerson[0].email
        : '';
      unitFullDetails.head.profile = headPerson[0].profile;
    }
  } else {
    unitFullDetails.head = null;
  }
  if (dict.has_accreds) {
    const unitPersons = await apimdService
      .getPersonsByUnit(dict.id_unite, lang);
    cosec = unitPersons[1];
    if (unitPersons[0].length > 0) {
      unitFullDetails.people = unitPersons[0];
    }
  } else {
    const subunits = await getSubunits(dict.id_unite, lang);
    if (subunits.length > 0) {
      unitFullDetails.subunits = subunits;
    }
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

  if (isInternal) {
    unitFullDetails.adminData = {
      'mailing-list': `https://cadiwww.epfl.ch/listes?unite=${dict.sigle}`,
      details: `https://units.epfl.ch/#/unites/${dict.id_unite}`,
      accreds: `https://accred.epfl.ch/#/catalog/units/${dict.id_unite}`
    };
    if (dict.has_accreds) {
      unitFullDetails.adminData['fmt-list'] =
        `https://search-backend.epfl.ch/api/unit/csv?q=${dict.sigle}` +
        `&hl=${lang}`;
    }
    if (cosec.length > 0) {
      const ldapCosecPerson = await peopleService.getPersonBySciper(
        cosec[0]
      );
      const cosecPerson = ldapUtil.ldap2api(ldapCosecPerson, '', lang);
      if (cosecPerson.length > 0) {
        unitFullDetails.cosec = {
          sciper: cosecPerson[0].sciper,
          profile: cosecPerson[0].profile,
          email: cosecPerson[0].email ? cosecPerson[0].email : '',
          name: cosecPerson[0].name,
          firstname: cosecPerson[0].firstname
        };
      }
    }
  }

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
                `AND ${visibleConditionByCmplType}` +
                `AND ${visibleConditionByHierarchy}`;
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

async function getCsv (acro, lang) {
  const unitData = await getUnit(acro, lang, false);
  if (!unitData.people) {
    return null;
  }
  const unitAcro = unitData.acronym;
  const unitPath = unitData.unitPath;
  const unitAddress = unitData.address ? unitData.address.join(', ') : '';

  const data = [];
  const header = lang === 'en'
    ? ['Name', 'First name', 'Sciper', 'email', 'Unit', 'Unit path',
        'Position', 'Office(s)', 'Phone(s)', 'Address']
    : ['Nom', 'Prénom', 'Sciper', 'email', 'Unité', "Chemin de l'unité",
        'Fonction', 'Bureau(x)', 'Téléphone(s)', 'Adresse'];

  data.push(header);

  unitData.people.forEach((person) => {
    data.push([
      person.name,
      person.firstname,
      person.sciper,
      person.email ? person.email : '',
      unitAcro,
      unitPath,
      person.position ? person.position : '',
      person.officeList.join(', '),
      person.phoneList.join(', '),
      unitAddress
    ]);
  });

  const formatRow = row => row.map(value => `"${value}"`).join(';');
  const csvData = data.map(formatRow).join('\n');

  return csvData;
}

function scoreSuggestions (a, q) {
  let points = 0;
  a = a.toLowerCase();
  if (a === q) {
    points += 2;
  } else if (a.includes(q)) {
    points += 1;
  }
  return points;
}

function sortSuggestions (array, q) {
  return array.sort((a, b) =>
    scoreSuggestions(b, q) - scoreSuggestions(a, q) ||
    a.localeCompare(b)
  );
}

async function getSuggestions (query) {
  const results = await apimdService.getUnits(query);
  const units = results.data.units;
  const suggestions = [];
  for (const unit of units) {
    if (!unit.path.includes('TECHNIQUE') &&
         unitsToShow.includes(unit.complementtype)) {
      suggestions.push(unit.name);
    }
  }
  return sortSuggestions(suggestions, query.toLowerCase());
}

module.exports = {
  get,
  getCsv,
  getSuggestions
};

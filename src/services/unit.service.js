const cadidbService = require('./cadidb.service');

async function get (params) {
  const lang = params.hl || 'fr';
  const q = params.q;
  const acro = params.acro;
  if (acro) {
    return await getUnitFullDetails(acro, lang);
  }

  const unitList = await searchUnit(q, lang);

  if (unitList.length === 0) {
    return unitList;
  } else if (unitList.length === 1) {
    return await getUnitFullDetails(unitList[0].acronym, lang);
  } else {
    return unitList;
  }
}

async function searchUnit (q, lang) {
  const query = 'SELECT sigle, libelle, libelle_en, hierarchie ' +
                'FROM Unites_v2 WHERE cmpl_type <> ? AND ' +
                '(sigle like ? OR libelle like ? OR libelle_en like ?)';
  const values = ['Z', '%' + q + '%', '%' + q + '%', '%' + q + '%'];

  try {
    const results = await cadidbService.sendQuery(query, values);
    console.log('Pourquoi ça print???');
    const formattedResults = results.map((dict) => {
      const modifiedDict = {
        acronym: dict.sigle,
        path: dict.hierarchie.split(' '),
        name: lang === 'en' ? dict.libelle_en : dict.libelle
      };
      return modifiedDict;
    });
    return formattedResults;
  } catch (err) {
    console.error('Error: ', err);
  }
}

// Get unit full details
async function getUnitFullDetails (acro, lang) {
  const query = 'SELECT sigle, id_unite, libelle, hierarchie, libelle_en, ' +
                'resp_sciper, resp_nom, resp_nom_usuel, resp_prenom, ' +
                'resp_prenom_usuel, url, faxes, adresse, cmpl_type, ghost, ' +
                'has_accreds ' +
                'FROM Unites_v2 ' +
                'WHERE sigle = ? AND cmpl_type <> ?';
  const values = [acro, 'Z'];

  try {
    const results = await cadidbService.sendQuery(query, values);
    if (results.length !== 1) {
      return;
    }
    const dict = results[0];
    const unitPath = await getUnitPath(dict.hierarchie, lang);
    const unitFullDetails = {
      code: dict.id_unite,
      acronym: dict.sigle,
      name: lang === 'en' ? dict.libelle_en : dict.libelle,
      unitPath: dict.hierarchie,
      path: unitPath,
      terminal: dict.has_accreds,
      ghost: dict.ghost,
      address: dict.adresse.split('$').map((value) => value.trim())
        .filter((value) => value !== ''),
      head: {
        sciper: dict.resp_sciper,
        name: dict.resp_nom_usuel || dict.resp_nom,
        firstname: dict.resp_prenom_usuel || dict.resp_prenom,
        email: '<EMAIL>', // TODO: Get email from ldap
        profile: '<EMAIL_PREFIX>' // TODO: Build from email over
      }
    };
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
  } catch (err) {
    console.error('Error: ', err);
  }
}

// Get unit path (acronym + name)
async function getUnitPath (hierarchy, lang) {
  const inHierarchyClause = `IN ('${hierarchy.split(' ').join("', '")}')`;
  const query = 'SELECT sigle, libelle, libelle_en ' +
                'FROM Unites_v2 ' +
                `WHERE sigle ${inHierarchyClause}`;
  const values = [];

  try {
    const results = await cadidbService.sendQuery(query, values);
    const formattedResults = results.map((dict) => {
      const modifiedDict = {
        acronym: dict.sigle,
        name: lang === 'en' ? dict.libelle_en || dict.libelle : dict.libelle
      };
      return modifiedDict;
    });
    return formattedResults;
  } catch (err) {
    console.error('Error: ', err);
  }
}

// Get Subunit(s) (acronym + name)
async function getSubunits (unitId, lang) {
  const query = 'SELECT sigle, libelle, libelle_en ' +
                'FROM Unites_v2 ' +
                'WHERE id_parent = ? AND cmpl_type <> ?';
  const values = [unitId, 'Z'];

  try {
    const results = await cadidbService.sendQuery(query, values);
    const formattedResults = results.map((dict) => {
      const modifiedDict = {
        acronym: dict.sigle,
        name: lang === 'en' ? dict.libelle_en || dict.libelle : dict.libelle
      };
      return modifiedDict;
    });
    return formattedResults;
  } catch (err) {
    console.error('Error: ', err);
  }
}

module.exports = {
  get
};

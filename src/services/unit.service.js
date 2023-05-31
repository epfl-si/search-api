// const unitConfig = require('../configs/unit.config');
const cadidbService = require('./cadidb.service');

let lang;

async function get (params) {
  lang = params.hl || 'fr';
  const q = params.q;
  const acro = params.acro;

  if (acro) {
    return await getUnitFullDetails(acro);
  }

  const unitList = await searchUnit(q);

  if (unitList.length === 0) {
    return unitList;
  } else if (unitList.length === 1) {
    return await getUnitFullDetails(unitList[0].acronym);
  } else {
    return unitList;
  }
}

async function searchUnit (q) {
  const query = 'SELECT sigle, libelle, libelle_en, hierarchie ' +
                'FROM Unites_v2 WHERE sigle like ?';
  const values = ['%' + q.toUpperCase() + '%'];

  try {
    const results = await cadidbService.sendQuery(query, values);
    const formattedResults = results.map((dict) => {
      const modifiedDict = {
        acronym: dict.sigle,
        path: dict.hierarchie.split(' '),
        name: dict.libelle_en
      };
      return modifiedDict;
    });
    return formattedResults;
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

async function getUnitFullDetails (acro) {
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
        email: '<EMAIL>', // TODO
        profile: '<EMAIL_PREFIX>' // TODO
      }
    };
    if (dict.url) {
      unitFullDetails.url = dict.url;
    }
    if (dict.has_accreds) {
      // Add people

    } else {
      // Add subunits
      unitFullDetails.subunits = await getSubunits(dict.id_unite, lang);
    }
    if (dict.faxes) {
      // Add faxes (Attention, plusieurs possible!)
      unitFullDetails.faxes = dict.faxes.split(',').map((fax) => {
        const trimmedFax = fax.trim();
        if (trimmedFax.startsWith('0')) {
          return trimmedFax.replace(/^0(\d{2})(.*)/, '+41 $1 $2');
        } else {
          return '+41 21 69' + trimmedFax;
        }
      });
    }

    // TODO: if intranet/VPN (req.get('X-EPFL-Internal') === 'TRUE') → ajouter les `adminData`

    return unitFullDetails;
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

// Get the Unit path hierarchy with details (acronym, name)
async function getUnitPath (hierarchy, language) {
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
        name: language === 'en' ? dict.libelle_en || dict.libelle : dict.libelle
      };
      return modifiedDict;
    });
    return formattedResults;
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

// Get the Subunit(s) with details (acronym, name)
async function getSubunits (id_unite, language) {
  const query = 'SELECT sigle, libelle, libelle_en ' +
                'FROM Unites_v2 ' +
                'WHERE id_parent = ? AND cmpl_type <> ?';
  const values = [id_unite, 'Z'];

  try {
    const results = await cadidbService.sendQuery(query, values);
    const formattedResults = results.map((dict) => {
      const modifiedDict = {
        acronym: dict.sigle,
        name: language === 'en' ? dict.libelle_en || dict.libelle : dict.libelle
      };
      return modifiedDict;
    });
    return formattedResults;
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

module.exports = {
  get
};

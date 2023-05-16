// const unitConfig = require('../configs/unit.config');
const cadidbService = require('./cadidb.service');

async function get (params) {
  const lang = params.hl || 'fr';
  const q = params.q;
  const acro = params.acro;

  const results = await searchUnit(q);

  // console.log(results.length + ' unit(s) found(s).');
  // console.log(results);

  const formatedResults = results.map((dict) => {
    const modifiedDict = {
      acronym: dict.sigle,
      path: dict.hierarchie.split(' '),
      name: dict.libelle_en
    };

    return modifiedDict;
  });

  // console.log(formatedResults);

  return formatedResults;
}

async function searchUnit (q) {
  const query = 'SELECT sigle, libelle, libelle_en, hierarchie FROM Unites_v2 WHERE sigle like ?';
  const values = ['%' + q.toUpperCase() + '%'];

  try {
    const results = await cadidbService.sendQuery(query, values);
    return results;
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

function getUnit (acro) {
  // Returns full details of the unit or 404
}

module.exports = {
  get
};

const apimdConfig = require('../configs/apimd.config');
const axios = require('axios');
const ldapUtils = require('../utils/ldap.util');

const apimdClient = axios.create({
  baseURL: apimdConfig.baseURL,
  timeout: 10000,
  auth: {
    username: apimdConfig.username,
    password: apimdConfig.password
  },
  headers: {
    Accept: 'application/json'
  }
});

async function getPersonsByUnit (unitId, lang) {
  const url = '/v1/epfl-search/' + unitId;
  const response = await apimdClient.get(url);
  const data = response.data;

  const authorizedScipers = data.authorizations
    .filter(a => a.name === 'botweb' && a.value.includes('y'))
    .map(a => a.persid.toString());

  const peoples = [];

  data.persons.forEach((person) => {
    if (authorizedScipers.includes(person.id)) {
      const people = {
        name: person.lastname,
        firstname: person.firstname,
        email: person.email,
        sciper: person.id,
        rank: 0,
        profile: ldapUtils.getProfile(person.email, person.id),
        phoneList: person.phones,
        officeList: person.rooms
      };
      const pos = data.accreds
        .filter(a => a.persid.toString() === person.id).map(a => a.position)[0];
      if (lang === 'en') {
        people.position = pos.labelen;
      } else {
        people.position = person.gender === 'M' ? pos.labelfr : pos.labelxx;
      }
      peoples.push(people);
    }
  });
  return peoples;
}

module.exports = {
  getPersonsByUnit
};

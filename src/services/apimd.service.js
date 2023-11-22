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

function getPosition (accred, gender, lang) {
  const position = accred.position;
  if (accred.origin === 's') {
    // Students have no position
    return lang === 'en'
      ? 'Student'
      : (gender === 'M' ? 'Étudiant' : 'Étudiante');
  } else if (!position) {
    return null;
  } else if (lang === 'en') {
    // lang EN
    if (position.labelen) {
      return position.labelen;
    } else {
      return gender === 'M'
        ? (position.labelfr ? position.labelfr : position.labelxx)
        : (position.labelxx ? position.labelxx : position.labelfr);
    }
  } else {
    // lang FR
    return gender === 'M'
      ? (position.labelfr ? position.labelfr : position.labelen)
      : (position.labelxx ? position.labelxx : position.labelen);
  }
}

function getPhoneList (person, unitId) {
  if (!person.phones) {
    return [];
  } else {
    return person.phones
      .filter(p => p.unitid === unitId.toString() && p.hidden === 0)
      .sort((a, b) => a.order - b.order)
      .map(p => p.number);
  }
}

function getOfficeList (person, unitId) {
  if (!person.rooms) {
    return [];
  } else {
    return person.rooms
      .filter(p => p.unitid === unitId.toString() && p.hidden === 0)
      .sort((a, b) => a.order - b.order)
      .map(p => p.name);
  }
}

async function getPersonsByUnit (unitId, lang) {
  const url = '/v1/epfl-search/' + unitId;
  const response = await apimdClient.get(url);
  const data = response.data;
  // authid 1 → botweb (Appear in the unit's web directory)
  const authorizedScipers = data.authorizations
    .filter(a => a.authid === 1 && a.value.includes('y'))
    .map(a => a.persid.toString());
  const peoples = [];

  data.persons.forEach((person) => {
    if (authorizedScipers.includes(person.id)) {
      const people = {
        name: person.lastnameusual
          ? person.lastnameusual
          : person.lastname,
        firstname: person.firstnameusual
          ? person.firstnameusual
          : person.firstname,
        email: person.email,
        sciper: person.id,
        rank: 0,
        profile: ldapUtils.getProfile(person.email, person.id)
      };
      people.phoneList = getPhoneList(person, unitId);
      people.officeList = getOfficeList(person, unitId);
      const accred = data.accreds
        .find(a => a.persid.toString() === person.id);
      people.position = getPosition(accred, person.gender, lang);
      peoples.push(people);
    }
  });
  return peoples.sort((a, b) =>
    a.name.localeCompare(b.name) ||
    a.firstname.localeCompare(b.firstname)
  );
}

module.exports = {
  getPersonsByUnit
};

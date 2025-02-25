const apimdConfig = require('../configs/apimd.config');
const axios = require('axios');
const ldapUtils = require('../utils/ldap.util');

const axiosConfig = {
  auth: {
    username: apimdConfig.username,
    password: apimdConfig.password
  },
  headers: {
    Accept: 'application/json'
  },
  timeout: 10000
};

function getPosition (accred, gender, lang) {
  const position = accred.origin === 's'
    ? {
        labelen: 'Student',
        labelfr: 'Etudiant',
        labelxx: 'Etudiante',
        labelinclusive: 'Etudiante/Etudiant'
      }
    : accred.position;
  if (!position) {
    return null;
  } else if (lang === 'en' && position.labelen) {
    return position.labelen;
  } else if (gender === 'M') {
    return position.labelfr
      ? position.labelfr
      : (position.labelxx ? position.labelxx : position.labelen);
  } else if (gender === 'F') {
    return position.labelxx
      ? position.labelxx
      : (position.labelfr ? position.labelfr : position.labelen);
  } else {
    return position.labelinclusive
      ? position.labelinclusive
      : (position.labelfr
          ? position.labelfr
          : (position.labelxx ? position.labelxx : position.labelen));
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
      .filter(
        p => p.unitid === unitId.toString() && p.hidden === 0 && p.name !== '')
      .sort((a, b) => a.order - b.order)
      .map(p => p.name);
  }
}

async function getPersonsByUnit (unitId, lang) {
  const url = '/v1/epfl-search/unit/' + unitId;
  const response = await axios.get(`${apimdConfig.baseURL}${url}`, axiosConfig);
  const data = response.data;
  // authid 1 → botweb (Appear in the unit's web directory)
  const authorizedScipers = data.authorizations
    .filter(a => a.authid === 1 && a.value.includes('y'))
    .map(a => a.persid.toString());
  const people = [];
  const cosec = data.cosec.authorizations
    .filter(a => a.authid === 97 && a.value.includes('y'))
    .map(a => a.persid.toString());

  data.persons.forEach((person) => {
    if (authorizedScipers.includes(person.id)) {
      const p = {
        name: person.lastnameusual
          ? person.lastnameusual
          : person.lastname,
        firstname: person.firstnameusual
          ? person.firstnameusual
          : person.firstname,
        email: person.email ? person.email : null,
        sciper: person.id,
        rank: 0,
        profile: ldapUtils.getProfile(person.email, person.id)
      };
      p.phoneList = getPhoneList(person, unitId);
      p.officeList = getOfficeList(person, unitId);
      const accred = data.accreds
        .find(a => a.persid.toString() === person.id);
      if (!accred) {
        // Skip the person if no accreditation
        return;
      }
      p.position = getPosition(accred, person.gender, lang);
      people.push(p);
    }
  });
  return [people.sort((a, b) =>
    a.name.localeCompare(b.name) ||
    a.firstname.localeCompare(b.firstname)
  ), cosec];
}

async function getUnits (query) {
  const route = '/v1/units';
  const config = structuredClone(axiosConfig);
  config.params = {
    query
  };

  return await axios.get(`${apimdConfig.baseURL}${route}`, config);
}

async function getRooms (query) {
  const route = '/v1/rooms';
  const config = structuredClone(axiosConfig);
  config.params = {
    query
  };

  return await axios.get(`${apimdConfig.baseURL}${route}`, config);
}

async function getPersonsBySciper (sciperList) {
  const route = '/v1/persons';
  const config = structuredClone(axiosConfig);
  config.params = {
    persid: sciperList.join(',')
  };
  return await axios.get(`${apimdConfig.baseURL}${route}`, config);
}

module.exports = {
  getPersonsBySciper,
  getPersonsByUnit,
  getRooms,
  getUnits
};




const contacts = {
  12: {
    id: 12,
    name: "Alpha Bravo",
    phone: "555-1234",
    email: "ab@example.com",
  },
  13: {
    id: 13,
    name: "Yankee Zulu",
    phone: "604-604-6044",
    email: "yz@example.com",
  }
};




function getContacts() {
  return Object.values(contacts);
}

function getContact(id) {
  return contacts[id];

}

function addContact(contact) {
  let id = Math.max(...Object.keys(contacts).map(val => Number(val))) + 1;
  console.log(Object.keys(contacts), Object.keys(contacts).map(val => Number(val)))
  let { name, phone, email } = contact;

  let saveableContact = {
    id,
    name,
    phone,
    email
  }

  contacts[id] = saveableContact;
  return id;
}

function updateContact(id, contact) {
  let oldContact = contacts[id];
  if (!oldContact) { return; }

  let { name, phone, email } = contact;
  let saveableContact = {
    ...oldContact,
    name,
    phone,
    email
  }

  contacts[id] = saveableContact;
}

function deleteContact(id) {
  delete contacts[id];
}

module.exports = {
  getContacts,
  getContact,
  addContact,
  updateContact,
  deleteContact,
}
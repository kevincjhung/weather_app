const express = require("express");
const bodyParser = require("body-parser")

const app = express();

const db = require("./fake-db")

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }));


app.get("/", (req, res) => {
  res.redirect('/contacts/list/')
})

app.get("/contacts/list", (req, res) => {
    // find all the contacts using some appropriate method in the db
    let contacts = db.getContacts();
    let id = req.params.id;

    // pass that data to the EJS
    res.render("contacts/index", {
      contacts: contacts,
      id, id

  });
})

app.get("/contacts/view/:id", (req, res) => {
  let id = req.params.id;
  let contact = db.getContact(id);
  let contacts = db.getContacts();
  console.log(id, contact);
  res.render("contacts/index2", {
    contact: contact,
    contacts, contacts,
    id: id
  });
})





/*
GET  /   (just redirects)   done?
GET  /contacts/list     done
GET  /contacts/view/:id    
GET  /contacts/create
POST /contacts/create
GET  /contacts/edit/:id
POST /contacts/edit/:id
GET  /contacts/deleteconfirm/:id
POST /contacts/delete/:id
*/

module.exports = app;
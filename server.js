const app = require('./app.js');
const express = require("express");
const PORT = 8000;

app.set("view engine", "ejs"); // using ejs
app.use(express.static("public"));

app.listen(PORT, () => console.log(`server should be running at http://localhost:${PORT}/`))
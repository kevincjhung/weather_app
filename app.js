require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser")
const cookieSession = require("cookie-session");
const luxon = require('luxon');

const app = express();


app.use(express.static("static"))
app.use(express.json())

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieSession({ name: 'session', keys: ['asdfasdbvaghjdfghaga'] }))


let db = require('./pass_db.js');
const read = require('body-parser/lib/read');



function nextDate(prevDate, i = 1) {
	return luxon.DateTime.fromISO(prevDate).plus({ days: i }).toISO().slice(0, 10)
}


app.get('/', (req, res) => {
	res.render('index')
})


let api = express.Router();
app.use('/api/v1', api);


api.get("/secrets", (req, res) => {
	res.send(`
    const NUMBER_OF_DAYS_IN_PLAN = ${process.env.NUMBER_OF_DAYS_IN_PLAN};
    const OPEN_WEATHER_API_KEY = "${process.env.OPEN_WEATHER_API_KEY}";
    const BCIT_LAT = ${process.env.BCIT_LAT};
    const BCIT_LON = ${process.env.BCIT_LON};
  `);
})
/**
 * try: 
 * ajax requests with api.get()
 */


// sign up user
app.post("/signup", (req, res) => {
	// get username & password that users entered
	const username = req.body.username;
	const password = req.body.password;

	// if username already taken returns false, else true
	let isNewUser = db.createUser(username, password)

	// username not taken
	if (isNewUser) {
		// set username and password to req.session
		req.session.username = username;

		let session = req.session;

		// account successfully created
		res.status(200).json(session);
	}

	// not a new user, aka account already exists
	if (!isNewUser) {
		res.status(400).json({ 'message': "Username is already taken" })
	}
})


// user login
app.post("/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	let userPwdGiven = username.length > 0 && password.length > 0;

	// if not given username or password 
	if (!userPwdGiven) {
		res.status(401).send({ "error": "empty username or password field" });
		return;
	}
	// null if not valid, 
	let loggedInUser = db.authenticateUser(username, password);

	if (loggedInUser) {
		req.session.username = username;
		res.status(201).json(req.session); // send to frontend. 201 Created
	}
})


// user logout
app.post("/logout", (req, res) => {
	req.session = null;
	// 204 no content
	res.status(200).json()
})

app.get("/session", (req, res) => { // send all to front end, get front end to sort and display
	let isSomeoneLoggedIn = req.session.username !== undefined;
	res.status(200).send(isSomeoneLoggedIn);
})


app.post("/placeVote", (req, res) => {
	let date = req.body.date;
	let vote = req.body.vote;
	let user = req.session.username;

	if (!user) {
		res.status(400).json({ "error": "login before voting" })
		console.error('login before voting')
	} else {
		db.placeVote(user, date, vote)
	}
})

app.post("/refreshVotes", (req, res) => {
	let datesNext7Days = req.body.datesNext7Days;
	let othersVotesNext7Days = [];
	let myVotesNext7Days = [];
	let isSomeoneLoggedIn = req.session.username !== undefined;
	
	// loop through datesNext7Days
	for (let dayIndex in datesNext7Days) {
		let theDate = datesNext7Days[dayIndex]
		let votesForGivenDate = db.getVotesForDate(theDate);

		othersVotesNext7Days.push(votesForGivenDate)
	}
	let othersVotes7Days = Array.from(othersVotesNext7Days)

	res.status(200).send(othersVotes7Days);
})

// // loop through datesNext7Days
// for (let dayIndex in datesNext7Days) {
//   let theDate = datesNext7Days[dayIndex]
//   let votesForGivenDate = db.getVotesForDate(theDate);

//   othersVotesNext7Days.push(votesForGivenDate)

//   for(let voteIndex = 0; voteIndex < votesForGivenDate.length; voteIndex++){
//     let singleVote = votesForGivenDate[voteIndex];
//     let voter = singleVote.who;
//     let currentUser = req.session.user;
//   }
// }

// console.log(othersVotesNext7Days)

// go through each vote, if who:"" == req.session.username, push to myvotes
// else push to votesForGivenDate
// send it back to frontend



module.exports = app;
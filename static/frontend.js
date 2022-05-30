
function createCard(date) {
  let card = document.createElement('div');
  card.innerHTML = `
    <div class="cardtop">
      <div class="date">
        <div class="dow">${date.toLocaleString({ weekday: 'long' })}</div>
        <div class="dom">${date.toLocaleString({ month: 'short', day: 'numeric' })}</div>
      </div>
      <div class="weather">
        <div class="temp">
          ?
        </div>
        <div class="weath">
          <img>
        </div>
      </div>
    </div>
    <div class="vote">
      Can you attend?
      <div>
        <button class="vote yes" data-vote="yes">
          Yes ✔️
        </button>
        <button class="vote maybe" data-vote="">
          ??
        </button>
        <button class="vote no" data-vote="no">
          No ❌
        </button>
      </div>
    </div>
    <div class="others">
    </div>
  `
  card.classList.add("card")
  card.dataset.date = date.toISO().slice(0, 10);
  return card;
}


function updateWeather(card, temp, weather, icon) {
  card.querySelector('.weather .temp').innerText = Number(temp).toFixed(0) + " C";
  card.querySelector('.weather .weath img').title = weather;

  let image_link = `https://openweathermap.org/img/wn/${icon}.png`;

  card.querySelector('.weather .weath img').src = image_link;
}


function updateWeatherByDate(dt, temp, weather, icon) {
  let card = document.querySelector(`.card[data-date="${dt}"]`);
  if (card) {
    updateWeather(card, temp, weather, icon);
  }
}

/**
 * @param {string} card 
 * @param {array} others, array of objects 
 * [{who: 'sam', vote: 'no'}, {who: 'jeremy', vote: 'yes'}]
 */
function updateOthers(card, others) {
  let othersContainer = card.querySelector(".others");
  othersContainer.innerHTML = '';
  others = others || [];
  for (let { who, vote } of others) {
    let div = document.createElement('div');
    div.classList.add(vote === 'yes' ? 'yes' : 'no');
    div.innerText = who;
    othersContainer.append(div);
  }
}


function updateMyVoting(card, myData) {
  let myVote = myData.length === 0 ? null : myData[0].vote;
  let yesButton = card.querySelector(".vote button.yes");
  let maybeButton = card.querySelector(".vote button.maybe");
  let noButton = card.querySelector(".vote button.no");

  card.querySelectorAll(".vote button").forEach(button => {
    button.classList.remove("quiet");
    button.classList.remove("loud");
  })

  yesButton.classList.add(myVote === "yes" ? "loud" : myVote === "no" ? "quiet" : "meh")
  noButton.classList.add(myVote === "no" ? "loud" : myVote === "yes" ? "quiet" : "meh")
  maybeButton.classList.add(myVote === "no" ? "quiet" : myVote === "yes" ? "quiet" : "meh")

}


let today = luxon.DateTime.now();
let cards = [];
let weekview = document.querySelector('.weekview')


for (let i = 0; i < NUMBER_OF_DAYS_IN_PLAN; i++) {
  card = createCard(today.plus({ days: i }));
  cards.push(card);
  weekview.append(card)
}

// populate array with formatted date of today + 6 more days
let todayFormatted = luxon.DateTime.now().toFormat('yyyy-MM-dd')
let datesNext7Days = []; // today + 6 more
for(let i = 0; i < NUMBER_OF_DAYS_IN_PLAN; i++){
  let date = luxon.DateTime.now().plus({days: i}).toFormat('yyyy-MM-dd')
  datesNext7Days.push(date)
}


let mySession;

let headerForLoggedIn = document.querySelectorAll('.forloggedin')
let headerForLoggedOut = document.querySelectorAll('.forloggedout')


function setMySession(newSession) {
  mySession = newSession;
  if (mySession) {
    headerForLoggedIn.forEach(elt => elt.classList.remove('nodisplay'))
    headerForLoggedOut.forEach(elt => elt.classList.add('nodisplay'))
  } else {
    headerForLoggedIn.forEach(elt => elt.classList.add('nodisplay'))
    headerForLoggedOut.forEach(elt => elt.classList.remove('nodisplay'))
  }
  refreshVotes();
}


function getSession(){
  axios.get("/session")
  .then(isSomeoneLoggedIn => {
    mySession = isSomeoneLoggedIn.data;
    console.log('mysession: ' + mySession);
  })
  .catch(error => console.error(error))
}
getSession()

// Pass session in setMySession()
setMySession(mySession);




// login-logout-signup
document.querySelector('form.forloggedout').addEventListener('click', event => {
  event.preventDefault();
  let username = document.querySelector('input#headerusername').value
  let password = document.querySelector('input#headerpassword').value
  
  if (event.target.classList.contains('signup')) {
    
    // Do not let user sign up if they did not provide both username and password
    if(username.length !== 0 && password.length !== 0){
      axios.post("/signup", {
        "username": username,
        "password": password
      })
      .then(res => {
        console.log(res)
      })
      .catch()
    }
  } else if (event.target.classList.contains('login')) {
    
    // don't let user login of they did not provide both username && password
    if(username.length !== 0 && password.length !== 0){
      axios.post("/login", {
        "username": username,
        "password": password
      })
      .then(res => {
        setMySession(res)
      })
      .catch(error => console.error(error));
    }
  }
})


// log out
document.querySelector('button.logout').addEventListener('click', event => {
  event.preventDefault();

  axios.post("/logout")
  .then(res => console.log(res))
  .catch(error => console.error(error))
  setMySession();
})


// refresh votes
document.querySelector('button.refresh').addEventListener('click', event => {
  event.preventDefault();
  refreshVotes();
})



function refreshVotes() {
  axios.post("/refreshVotes", {
    "datesNext7Days": datesNext7Days
  })
  .then(votesData => {  
    let votesByDayArray = votesData.data;
     
    for(let votesByDayIndex in votesByDayArray){
      let votesByDay = votesByDayArray[votesByDayIndex];
      let curCard = cards[votesByDayIndex]
      updateOthers(curCard, votesByDay)
    }
  })
  .catch(error => console.error(error))
}

 // console.log(votesByDay)
      // for(let vote in votesByDay){
      //   let singleVote = votesByDay[vote];
      //   let voter = singleVote.who;
        
      //   // if nobody logged in, all votes go into updateOthers()
        
      //   // console.log(votesByDay[vote]) 
      //   // console.log(`${votesByDayIndex}, ${vote}`)
      // }

       // array of votes by day. [0] is array of object with votes for today. [1] is tomorrow
    // let votesByDayArray = Array.from(res.data)


function placeVote(date, vote) {
  axios.post("/placeVote", {
    "date": date, 
    "vote": vote
  })
  .then()
  .catch(err => console.error(err))
}

document.querySelector('main').addEventListener('click', (event) => {
  if (event.target.tagName === 'button'.toUpperCase() && event.target.classList.contains('vote')) {
    let date = event.target.closest('.card').dataset.date;
    let vote = event.target.dataset.vote || null;
    // console.log({ date, vote })
    placeVote(date, vote)
  }
})


// sends api request to openWeatherMap, uses returned info to call updateWeather() and updateWeatherByDate()
function getWeather(){

  // datetime, unix timestamp for api request
  let dt = today.ts;
 
  // url for sending api request
  let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${BCIT_LAT}&lon=${BCIT_LON}&dt=${dt}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;

  // send the ajax request to the weather api
  fetch(url)
  .then(response => { 
    return response.json()
  })
  .then(data => {
    let weatherAllDaysArr = Array.from(data.daily)
    
    for(dayIndex in weatherAllDaysArr){
      // get weather description, temperature in daytime, icon 
      let dayTemp = Math.round(weatherAllDaysArr[dayIndex].temp.day);
      let weatherDescription = weatherAllDaysArr[dayIndex].weather[0].description
      let icon = weatherAllDaysArr[dayIndex].weather[0].icon
      let currentCard = cards[dayIndex];
      
      updateWeatherByDate(dt, dayTemp, weatherDescription, icon);
      updateWeather(currentCard, dayTemp, weatherDescription, icon);
    }
  })
  .catch(error => console.error(error))
}
getWeather()



refreshVotes();
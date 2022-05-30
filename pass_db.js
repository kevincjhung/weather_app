
let users = {
  'jholman': {
    username: 'jholman',
    password: 'a'
  },
  'smw': {
    username: 'smw',
    password: 'a'
  },
  'patrick': {
    username: 'patrick',
    password: 'a'
  },
}

// vote dates have been changed so there's more to display
let votes = {
  'jholman': {
    '2022-04-19': 'yes',
    '2022-04-20': 'yes',
    '2022-04-21': 'yes',
  },
  'smw': {
    '2022-04-22': 'no',
    '2022-04-23': 'no',
    '2022-04-24': 'no'
  },
  'patrick': {
    '2022-04-25': 'yes',
  }
}


function isUsernameTaken(username) {
  return !!users[username];
}

function createUser(username, password) {
  if (!isUsernameTaken(username)) {
    users[username] = {
      username,
      password,
    }
    return true;
  } else {
    return false;
  }
}

function authenticateUser(username, password) {
  if (users[username]) {
    let user = users[username];
    if (user.password === password) {
      return { username: user.username }
    }
  } else {
    return null;
  }
}

function getVotesForDate(date) {
  let ans = [];
  for (let voter in votes) {
    for (let votedate in votes[voter]) {
      if (votedate === date && votes[voter][date]) {
        ans.push({ who: voter, vote: votes[voter][date] })
      }
    }
  }
  return ans;
}

function placeVote(username, date, vote) {
  console.log("place vote: ", { username, date, vote })
  // console.log(votes[username])

  if (votes[username] === undefined) {
    votes[username] = {};
  }
  if (vote === null) {
    delete votes[username][date];
  } else {
    votes[username][date] = vote;
  }
}




module.exports = {
  isUsernameTaken,
  createUser,
  authenticateUser,
  getVotesForDate,
  placeVote,
}
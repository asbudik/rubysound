var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var db = require("./models/index.js");
var flash = require("connect-flash");
var request = require("request");
app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());                   // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(morgan('dev'))

app.set("view engine", "ejs");

app.post('/api/searchsongs', function(req, res) {
  var searchURL = "https://api.spotify.com/v1/search?q="
  + req.body.query + "&type=artist,track"

  request(searchURL, function(error, response, body) {
    if(!error) {
      var bodyData = JSON.parse(body);
      res.json(bodyData)
    }
  })
})

app.get('/api/users', function(req, res) {
  db.user.findAll({order: [['createdAt', 'DESC']]}).success(function(allUsers) {
    res.json(allUsers)
  })
})

app.post('/api/users', function(req, res) {
  db.user.create(req.body).success(function(newUser) {
    res.json(newUser)
  })
})

app.get('/api/users/:id', function(req, res) {
  db.user.find(req.params.id).success(function(foundUser) {
    foundUser.getSongs().success(function(userSongs) {
      res.json({user: foundUser, songs: userSongs})
    })
  })
})

app.put('/api/users/:id', function(req, res) {
  db.user.find(req.params.id).success(function(foundUser) {
    foundUser.updateAttributes(req.body).success(function() {
      res.json(foundUser)
    })
  })
})

app.post('/api/users/:id/songs', function(req, res) {
  db.user.find(req.params.id).success(function(foundUser) {
    db.song.create(req.body).success(function(newSong) {
      foundUser.addSong(newSong).success(function() {
        res.json({user: foundUser, song: newSong})
      })
    })
  })
})

// app.post('api/songs/:id/votes', function(req, res) {
//   db.song.find(req.params.id).success(function(foundSong) {
//     db.vote.create(req.body).success(function(newVote) {
//       foundSong.addVote(newVote).success(function() {
//         res.json({song: foundSong, vote: newVote})
//       })
//     })
//   })
// })


app.get('*', function(req, res) {
  res.render('index', {soundcloud_id: process.env.SOUNDCLOUD_ID}); // load the single view file (angular will handle the page changes on the front-end)
});

app.listen(3000, function() {
  console.log("SERVER LISTENING ON 3000")
})
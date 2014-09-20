var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var morgan = require('morgan');
var bodyParser = require('body-parser');
var db = require("./models/index.js");
var flash = require("connect-flash");
var request = require("request");
var io = require('socket.io')(http);


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());                   // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(morgan('dev'))

app.set("view engine", "html");

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});


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

app.post('/api/searchlivebands', function(req, res) {
  var bandsInTownURL = 'http://api.bandsintown.com/artists/' 
  + req.body.track + '/events.json?api_version=2.0&app_id=RUBYSOUND'
  
  request(bandsInTownURL, function(error, response, body) {
    if(!error) {
      var bandData = JSON.parse(body)
      res.json(bandData)
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
  res.render('index.ejs')
});

http.listen(3000, function() {
  console.log("SERVER LISTENING ON 3000")
})
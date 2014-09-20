var express =       require('express');
var app =           require('express')();
var http =          require('http').Server(app);
var morgan =        require('morgan');
var bodyParser =    require('body-parser');
var db =            require("./models/index.js");
var flash =         require("connect-flash");
var request =       require("request");
var io =            require('socket.io')(http);
var passport =      require("passport");
var passportLocal = require("passport-local");
var cookieParser =  require("cookie-parser");
var cookieSession = require("cookie-session");
var server =        require('http').createServer(app)

var clients = []
var currentUser = undefined

app.set("view engine", "html");

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(morgan('dev'))

app.use(cookieSession({
  secret: process.env.COOKIE_SECRET,
  name: process.env.COOKIE_NAME,
  maxage: 300000
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser(function(user, done) {
  console.log("SERIALIZED");
  done(null, user.id);
})

passport.deserializeUser(function(id, done) {
  console.log("DESERIALIZED");
  db.user.find({
    where: {
      id: id
    }
  }).done(function(error, user) {
    done(error, user)
  })
})

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    if (currentUser === undefined || currentUser === {username: 'Guest'}) {
      currentUser = {username: 'Guest'}
    }
    io.emit('chat message', currentUser.username + ": " + msg);
    clients.forEach(function(client) {
      socket["client.id"] = client.username
      console.log("stuff", socket["client.id"])
    })
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
    res.json({allusers: allUsers, session: req.user})
  })
})

app.post('/api/users', function(req, res) {
  db.user.createNewUser(
    req.body,
    function(err) {
      res.json({message: err.message})
    },
    function(success) {
        res.json({user: success.user, message: success.message})
    });
  });

app.post('/api/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return res.json({message: "Login or password incorrect"}) }
    if (!user) { return res.json({message: "Login or password incorrect"}) }
    req.logIn(user, function(err) {
      if (err) { return res.json({message: "Login or password incorrect"}) }
      currentUser = {id: req.user.id, username: req.user.username}
      clients.push({id: req.user.id, username: req.user.username})
      return res.json(req.user)
    });
  })(req, res, next);
});


// app.get('/api/users/:id', function(req, res) {
//   db.user.find(req.params.id).success(function(foundUser) {
//     foundUser.getSongs().success(function(userSongs) {
//       res.json({user: foundUser, songs: userSongs})
//     })
//   })
// })

// app.put('/api/users/:id', function(req, res) {
//   db.user.find(req.params.id).success(function(foundUser) {
//     foundUser.updateAttributes(req.body).success(function() {
//       res.json(foundUser)
//     })
//   })
// })

// app.post('/api/users/:id/songs', function(req, res) {
//   db.user.find(req.params.id).success(function(foundUser) {
//     db.song.create(req.body).success(function(newSong) {
//       foundUser.addSong(newSong).success(function() {
//         res.json({user: foundUser, song: newSong})
//       })
//     })
//   })
// })

// app.post('api/songs/:id/votes', function(req, res) {
//   db.song.find(req.params.id).success(function(foundSong) {
//     db.vote.create(req.body).success(function(newVote) {
//       foundSong.addVote(newVote).success(function() {
//         res.json({song: foundSong, vote: newVote})
//       })
//     })
//   })
// })

app.get('/logout', function(req, res) {
  clients.forEach(function(client) {
    if (req.user.id === client.id) {
      clients.splice(clients.indexOf(client))
    }
  })
  currentUser = undefined
  req.logout()
  res.redirect("/")
})

app.get('*', function(req, res) {
  res.render('index.ejs', {isAuthenticated: req.isAuthenticated()})
});

http.listen(3000, function() {
  console.log("SERVER LISTENING ON 3000")
})
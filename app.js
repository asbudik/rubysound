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
  maxage: 300000000
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
  socket.nickname = currentUser
  socket.on('chat message', function(msg){
    io.emit('chat message', {msg: msg, nick: socket.nickname});
  });
});


app.post('/api/spotify', function(req, res) {
  var searchURL = "https://api.spotify.com/v1/search?q="
  + req.body.query + "&type=artist,track&limit=" + req.body.limiter

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

 app.post('/api/soundcloud', function(req, res) {
  var searchURL = 'http://api.soundcloud.com/tracks.json?client_id='
  + process.env.SOUNDCLOUD_ID + '&q=' + req.body.query + '&limit=10'
 
   request(searchURL, function(error, response, body) {
     if(!error) {
       var bodyData = JSON.parse(body);
      res.json(bodyData)
     }
   })
 })

app.get('/api/users', function(req, res) {
  db.user.findAll({order: [['createdAt', 'DESC']]}).success(function(allUsers) {
    res.json({allusers: allUsers, session: req.user})
  })
})

app.post('/users', function(req, res) {
  db.user.createNewUser(
    req.body.user,
    function(err) {
      res.redirect('/')
    },
    function(success) {
      currentUser = success.user.username
      req.login(success.user, function(err) {
        return res.redirect('/')
      })
    });
  });

app.post('/login', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/',
  failureFlash: true
}));


app.post('/api/users/:id/songs', function(req, res) {
  db.user.find(req.params.id).success(function(foundUser) {
    db.song.create(req.body).success(function(newSong) {
      foundUser.addSong(newSong).success(function() {
        res.json({user: foundUser, song: newSong})
      })
    })
  })
})

app.post('/api/songs/:id/venues', function(req, res) {
  db.song.find(req.params.id).success(function(foundSong) {
    db.venue.create(req.body).success(function(newVenue) {
      foundSong.addVenue(newVenue).success(function() {
        res.json({song: foundSong, venue: newVenue})
      })
    })
  })
})

app.get('/logout', function(req, res) {
  currentUser = undefined
  req.logout()
  res.redirect("/")
})

app.get('*', function(req, res) {
  if (req.user) {
    currentUser = req.user.username
  } else {
    currentUser = "Guest"
  }

  res.render('index.ejs', {isAuthenticated: req.isAuthenticated(), user: req.user})
});

http.listen(3000, function() {
  console.log("SERVER LISTENING ON 3000")
})
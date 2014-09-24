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
    if(body) {
      var bandData = JSON.parse(body)
      res.json(bandData)
    } else {
      res.json({msg: "Sorry, an error has occured"})
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
  db.queue.findAll({order: [['createdAt', 'ASC']]}).success(function(allQueues) {
    songs = []
    allQueues.forEach(function(oneQueue) {
      oneQueue.getVotes({order: [['createdAt', 'DESC']]}).success(function(queueVotes) {
          songs.push([oneQueue, queueVotes])
      })
    })
    db.user.findAll({order: [['contributions', 'DESC']]}).success(function(allUsers) {
      res.json({allusers: allUsers, session: req.user, queue: songs})
    })
  })
})

app.post('/api/users', function(req, res) {
  db.user.createNewUser(req.body,
  function(err) {
    res.json({message: err.message})
  },
  function(success) {
    passport.serializeUser(function(user, done) {
      console.log("Initial serialize");
      done(null, success.user.id)
    })
    res.json({user: success.user, isAuthenticated: req.isAuthenticated(),
    message: success.message})
  });
});


app.post('/api/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return res.json({message: "Login or password incorrect"}) }
    if (!user) { return res.json({message: "Login or password incorrect"}) }
    req.logIn(user, function(err) {
      if (err) { return res.json({message: "Login or password incorrect"}) }
      return res.json({user: req.user})

    });
  })(req, res, next);
});


app.post('/api/users/:id/songs', function(req, res) {
  db.user.find(req.params.id).success(function(oneUser) {
    oneUser.updateAttributes({contributions: oneUser.contributions += 1, image: req.body.image}).success(function(foundUser) {
      db.song.create(req.body).success(function(newSong) {
        if (foundUser !== undefined) {

          foundUser.addSong(newSong).success(function() {})
        }
        db.user.findAll({order: [['contributions', 'DESC']]}).success(function(allUsers) {
          db.queue.create(req.body).success(function(newQueue){
            db.vote.create().success(function(newVote) {
              newQueue.addVote(newVote).success(function() {
                res.json({user: foundUser || undefined, song: newSong, queue: newQueue, vote: newVote, allusers: allUsers})
              })
            })
          })
        })
      })
    })
  })
})

app.post('/api/songs/:id/venues', function(req, res) {
  db.queue.find(req.params.id).success(function(foundQueue) {
    db.venue.create(req.body).success(function(newVenue) {
      foundQueue.addVenue(newVenue).success(function() {
        res.json({song: foundQueue, venue: newVenue})
      })
    })
  })
})

app.post('/api/queues/:id/votes', function(req, res) {
  db.queue.find(req.body.song[0].id).success(function(foundQueue) {
    db.vote.create({count: req.body.song[1][0].count += 1, uservote: req.body.user}).success(function(newVote) {
      foundQueue.addVote(newVote).success(function() {
        res.json({song: foundQueue, vote: newVote})
      })
    })
  })
})
app.get('/logout', function(req, res) {
  currentUser = undefined
  req.logout()
  res.redirect("/")
})

app.delete('/api/queues/:id', function(req, res) {
  db.queue.find(req.params.id).success(function(foundQueue) {
    res.json(foundQueue.destroy())
  })
})

app.get('*', function(req, res) {
  if (req.user) {
    currentUser = req.user.username
  } else {
    currentUser = "Guest"
  }

  res.render('index.ejs', {isAuthenticated: req.isAuthenticated(), user: req.user})
});

http.listen(process.env.PORT || 3000), function() {
  console.log("SERVER LISTENING ON 3000")
})
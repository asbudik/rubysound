var express =       require('express');
var app =           require('express')();
var http =          require('http').Server(app);
var morgan =        require('morgan');
var bodyParser =    require('body-parser');
var db =            require("./models/index.js");
var flash =         require("connect-flash");
var request =       require("request");
var passport =      require("passport");
var passportLocal = require("passport-local");
var cookieParser =  require("cookie-parser");
var cookieSession = require("cookie-session");
var server =        require('http').createServer(app);
var io =            require('socket.io').listen(server);

var currentUser = undefined;
var expressPort = process.env.PORT || 3000;

app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(morgan('dev'));

app.use(cookieSession({
  secret: process.env.COOKIE_SECRET,
  name: process.env.COOKIE_NAME,
  maxAge: 300000000
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser((user, done) => {
  console.log('SERIALIZED');
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('DESERIALIZED');
  db.User.find({
    where: {
      id: id
    }
  }).then(user => {
    return done(null, user);
  }).catch(err => {
    return done(err);
  });
});

io.sockets.on('connection', socket => {
  socket.on('send msg', data => {
    console.log('DATA APP JS', data);
    io.sockets.emit('get msg', data);
  });

  socket.on('send create song', createSong => {
    io.sockets.emit('get create song', createSong);
  });

  socket.on('send delete song', deleteSongs => {
    io.sockets.emit('get delete song', deleteSongs);
  });

  socket.on('send add vote', data => {
    io.sockets.emit('get add vote', data);
  });
});

app.post('/api/spotify', (req, res) => {
  var searchURL = 'https://api.spotify.com/v1/search?q=' +
    req.body.query +
    '&type=artist,track&limit=' +
    req.body.limiter;

  request(searchURL, (err, response, body) => {
    if (!err) {
      var bodyData = JSON.parse(body);
      res.json(bodyData);
    }
  });
})

app.post('/api/searchlivebands', (req, res) => {
  var bandsInTownURL = 'http://api.bandsintown.com/artists/' +
    req.body.track +
    '/events.json?api_version=2.0&app_id=RUBYSOUND';

  request(bandsInTownURL, (error, response, body) => {
    if(body) {
      var bandData = JSON.parse(body);
      res.json(bandData);
    } else {
      res.json({
        msg: 'Sorry, an error has occured'
      });
    }
  })
})

app.post('/api/soundcloud', (req, res) => {
  var searchURL = 'http://api.soundcloud.com/tracks.json?client_id=' +
    process.env.SOUNDCLOUD_ID +
    '&q=' +
    req.body.query +
    '&limit=10';

   request(searchURL, (err, response, body) => {
     if (!err) {
       var bodyData = JSON.parse(body);
       res.json(bodyData);
     }
   });
});

app.get('/api/users', (req, res) => {
  db.Queue.findAll({
    order: [['createdAt', 'ASC']]
  }).then(allQueues => {
    songs = []
    if (allQueues) {
      allQueues.forEach(oneQueue => {
        oneQueue.getVotes({
          order: [['createdAt', 'DESC']]
        }).then(queueVotes => {
            songs.push([oneQueue, queueVotes]);
        });
      });
    }

    db.User.findAll({
      order: [['contributions', 'DESC']]
    }).then(allUsers => {
      res.json({
        allusers: allUsers || [],
        session: req.user || undefined,
        queue: songs
      });
    });
  });
})

app.post('/api/users', (req, res) => {
  db.User.create(req.body).then(success => {
    passport.serializeUser((user, done) => {
      console.log('Initial serialize');
      return done(null, success.user.id);
    });
    res.json({
      user: success.user,
      isAuthenticated: req.isAuthenticated(),
      message: success.message
    });
  }).catch(err => {
    console.log('Creating new user failed: ', err);
    res.json({
      message: err.message
    });
  });
});

app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    var authenticationErrMsg = 'Login or password incorrect';

    if (err) {
      return res.json({
        message: authenticationErrMsg
      });
    }

    if (!user) {
      return res.json({
        message: authenticationErrMsg
      });
    }

    req.logIn(user, function(err) {
      if (err) {
        return res.json({
          message: authenticationErrMsg
        });
      }

      return res.json({
        user: req.user
      });
    });
  })(req, res, next);
});


app.post('/api/users/:id/songs', (req, res) => {
  db.User.find(req.params.id).then(oneUser => {
    oneUser.updateAttributes({
      contributions: oneUser.contributions += 1,
      image: req.body.image
    }).then(foundUser => {
      db.Song.create({
        title: req.body.title,
        artist: req.body.artist,
        image: req.body.image,
        playthrough: req.body.playthrough
      }).then(newSong => {
        if (foundUser !== undefined) {
          // the original success/then fn was a no-op so I'll preserve that here
          foundUser.addSong(newSong);
        }
        db.User.findAll({
          order: [['contributions', 'DESC']]
        }).then(allUsers => {
          db.Queue.create(req.body).then(newQueue => {
            db.Vote.create().then(newVote => {
              newQueue.addVote(newVote).success(() => {
                res.json({
                  user: foundUser || undefined,
                  song: newSong,
                  queue: newQueue,
                  vote: newVote,
                  allusers: allUsers
                });
              });
            });
          });
        });
      });
    });
  });
});

app.post('/api/songs/:id/venues', (req, res) => {
  db.Queue.find(req.params.id).then(foundQueue => {
    db.Venue.create(req.body).then(newVenue => {
      foundQueue.addVenue(newVenue).then(() => {
        res.json({
          song: foundQueue,
          venue: newVenue
        });
      });
    });
  });
});

app.post('/api/queues/:id/votes', (req, res) => {
  db.Queue.find(req.body.song[0].id).then(foundQueue => {
    db.Vote.create({
      count: req.body.song[1][0].count += 1,
      uservote: req.body.user
    }).then(newVote => {
      foundQueue.addVote(newVote).then(() => {
        res.json({
          song: foundQueue,
          vote: newVote
        });
      });
    });
  });
});

app.get('/logout', (req, res) => {
  currentUser = undefined;
  req.logout();
  res.redirect('/');
});

app.delete('/api/queues/:id', (req, res) => {
  db.Queue.find(req.params.id).then(foundQueue => {
    if (!foundQueue) {
      res.json('song does not exist');
    }

    res.json(foundQueue.destroy());
  });
});

app.get('*', (req, res) => {
  if (req.user) {
    currentUser = req.user.username;
  } else {
    currentUser = 'Guest';
  }

  res.render('index.ejs', {
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});

server.listen(expressPort, () => {
  console.log('Server listening on http://localhost:' + expressPort);
});

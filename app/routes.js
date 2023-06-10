require('dotenv').config()
module.exports = function (app, passport, db) {
  const ObjectID = require('mongodb').ObjectID
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // Event SECTION =========================
  app.get('/connect', isLoggedIn, function (req, res) {
    console.log(req.query)
    db.collection('messages').find({}).toArray((err, result) => {
      result = result.filter(message => {
        const distance = calculateDistance(message.lat, message.lon, parseFloat(req.query.latitude), parseFloat(req.query.longitude))
        return distance <= 5
      })
      if (err) return console.log(err)
      res.render('connect.ejs', {
        user: req.user,
        messages: result
      })
    })
  });


  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
  
    return distance;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }


  app.post('/messages', (req, res) => {
    db.collection('messages').save({ name: req.body.name, msg: req.body.msg, replies: [], lat: parseFloat(req.body.latitude), lon: parseFloat(req.body.longitude) }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect(`/connect`)
    })
  })
  
  app.post('/saved', (req, res) => {
    db.collection('saved').save({ user: req.body.user, name: req.body.name, link: req.body.link, git: req.body.git, twit: req.body.twit, chat: req.body.chat }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect(`/myprofile`)
    })
  })

  app.post('/socials', (req, res) => {
    db.collection('socials').save({ name: req.body.name, link: req.body.link, git: req.body.git, twit: req.body.twit, chat: req.body.chat }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect(`/mysetting`)
    })
  })

  app.get('/myprofile', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, messages) => {
      if (err) return console.log(err)
      db.collection('saved').find().toArray((err, saved) => {
        if (err) return console.log(err)
      db.collection('socials').find().toArray((err, socials) => {
        if (err) return console.log(err)
        res.render('myprofile.ejs', {
          user: req.user,
          saved: saved,
          messages: messages,
          socials: socials
        })
      })
      })
    })
  });

  app.get('/mysetting', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, messages) => {
      if (err) return console.log(err)
      db.collection('socials').find().toArray((err, socials) => {
        if (err) return console.log(err)
        res.render('mysetting.ejs', {
          user: req.user,
          socials: socials,
          messages: messages
        })
      })
    })
  });


  app.put('/reply', function (req, res) {
    const newRepliesName = req.user.local.email
    const updateObject = {};
    updateObject[newRepliesName] = req.body.msg;
  
    db.collection('messages').findOneAndUpdate(
      { _id: ObjectID(req.body.msgId) },
      { $push: 
        { 
          replies: updateObject 
        } 
      },
      (err, result) => {
        if (err) return res.send(err);
        res.send(result);
      }
    );
  });

  app.delete('/saved', (req, res) => {
    db.collection('saved').findOneAndDelete({ name: req.body.saved }, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('Message deleted!');
    });
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/connectLocation', function (req, res) {
    res.render('connectLocation.ejs', { message: req.flash('loginMessage') });
  });

  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/connectLocation', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/connectLocation', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/connect');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}

const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const massive = require('massive');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

massive(process.env.CONNECTION_STRING)
    .then((db)=>{
        console.log('the server is sawing logs');
        app.set('db', db);
    })
    .catch(err => {
        console.warn('Failed to connect:');
        console.error(err);
    });

passport.use('login', new LocalStrategy({
    usernameField: 'email', // req.body.email != req.body.username
    passReqToCallback: true,
}, (req, email, password, done) => {
    req.db.user_table.findOne({ email })
        .then(user => {
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return done('Invalid email or password');
            }
            
            delete user.password;
            
            done(null, user);
        })
        .catch(err => {
            done(err);
        });
}));

passport.use('register', new LocalStrategy({
    usernameField: 'email', // req.body.email != req.body.username
    passReqToCallback: true,
}, (req, email, password, done) => {
    if (!email || !password) {
        return done('Email and password are required');
    }
    
    const {first_name, last_name} = req.body;

    password = bcrypt.hashSync(password, bcrypt.genSaltSync(15));
    
    req.db.user_table.insert({ email, password, user_type:"non-client", first_name, last_name })
        .then(user => {
            delete user.password;
            
            done(null, user);
        })
        .catch(err => done(err));
}));


passport.serializeUser((user, done) => {
    if (!user) {
        done('No user');
    }
    
    done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
    const db = app.get('db');
    
    if (!db) {
        return done('Internal Server Error');
    }
    
    db.user_table.findOne({ user_id: id })
        .then(user => {
            if (!user) {
                return done(null, false);
            }
            
            delete user.password;
            
            done(null, user);
        })
        .catch(err => done(err));
});


app.use(cors());
app.use(bodyParser.json());
app.use(session({
    name: 'helpside',
    secret: process.env.SESSION_SECRET, // {userId: 1} => apowienpafosdihvpoaiwnpeiruhpasokmv287394erijf
                                        // apowienpafosdihvpoaiwnpeiruhpasokmv287394erijf => {userId: 1}
    cookie: {
        //days hours minutes seconds milseconds
        expires:  5 * 24 * 60 * 60 *1000,
    },
    saveUninitialized: false,
    rolling: true,
    resave: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'build')));

app.use(checkDb());
//------------------------------------------------------------



app.get(`/api/dashboard/:id`, (req, res) => {
    const db = req.app.get('db');
    if (!req.user) {
        return res.status(403).send('Please Login')
    }
  db.getAll()
  .then(info => {
      res.send(info);
    })
})

app.get(`/api/user`, (req, res) => {
    const db = req.app.get('db');
    

    req.db.user_table.findOne({user_id:req.user.user_id})
    .then((user)=>{
        return res.send(user)
    })
    
})
app.put(`/api/user`, (req, res) => {
    const db = req.app.get('db');
    const {first_name, last_name, email, user_id} = req.body
    db.updateUser(first_name, last_name, email, user_id)
    .then(user => {
        res.send("success")
    })
    .catch(err => {
        console.error(err);
    })
})

app.get('/*', (req, res) => {
  res.sendFile('index.html', {
      root: path.join(__dirname, "build")
    })
})


app.post('/api/login', passport.authenticate(['login']), (req, res) => {
    res.send({
        message: 'Welcome to the jungle',
        user:req.user,
        success: true,
    })
});

app.post('/api/register', passport.authenticate(['register']), (req, res) => {
    res.send({
        message: 'Welcome to the jungle',
        user:req.user,
        success: true,
    })
});

app.post(`/api/save`, (req, res) => {
    const db = req.app.get('db');
    const {title, img, ref, notes, tags, status} = req.body
    db.saveTile([title, img, ref, notes, tags, status])
    .then((response) =>{
        res.send("response");
    })
    .catch((err) =>{
        console.error(err);
    })
    
})

app.delete('/api/delete/:id', (req, res) => {
    const db = req.app.get('db');
    
    req.db.info_table.destroy({ id:parseInt(req.params.id) })
    .then(tile => {
        res.send(tile);
    })
    .catch(err => {
        console.error(err)
    })
})

//------------------------------------------------------------

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('this port is awesome', port)
});


function checkDb() {
  return (req, res, next) => {
    const db = app.get('db');

    if (db) {
      req.db = db;
      next();
    } else {
      res.status(500).send({
        message: 'this died'
      });
    }
  };
}

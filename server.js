const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const massive = require('massive');

require('dotenv').config();

const app = express();

massive(process.env.CONNECTION_STRING)
  .then((db) => {
    console.log('the server is sawing logs');
    app.set('db', db);
  })
  .catch(err => {
    console.warn('Failed to connect:');
    console.error(err);
  });

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  name: 'helpside',
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: true,
}));

app.use(express.static(path.join(__dirname, 'build')));

app.use(checkDb());
//------------------------------------------------------------
app.post('/api/login', (req, res) => {
  const {
    email,
    password
  } = req.body;

  req.db.user_table.findOne({
      email,
      password
    })
    .then(user => {
      if (!user) {
        return res.status(404).send({
          success: false,
          message: 'User not found'
        });
      }
      req.session.user = user.user_id;
      delete user.password;
      res.send({
        success: true,
        message: 'Logged in successfully',
        user
      });
    })
    .catch(err => {
      console.error(err)
      res.status(500).send(err)
    });
});


app.post('/api/register', (req, res) => {
  const db = req.app.get('db');
  const {
    email,
    password,
    first_name,
    last_name,
    user_type
  } = req.body;

  req.db.user_table.insert({
      email,
      password,
      first_name,
      last_name,
      user_type
    })
    .then(user => {
      req.session.user = user.user_id;
      console.log(req.session.user)
      res.send({
        success: true,
        message: 'logged in successfully'
      });
    })
    .catch(handleDbError(res));
});

app.get(`/api/dashboard/:id`, (req, res) => {
  const db = req.app.get('db');
  if (!req.session.user) {
    return res.status(403).send('Please Login')
  }
  db.getAll()
    .then(info => {
      res.send(info);
    })
})

app.get(`/api/user`, async (req, res) => {
  const db = req.app.get('db');

  if (!req.session.user) {
    return res.status(403).send(`Please login`)
  }
  const user = await req.db.user_table.findOne(req.session.user)

  return res.send(user)
})

app.get('/*', (req, res) => {
  res.sendFile('index.html', {
    root: path.join(__dirname, "build")
  })
})

app.delete('/api/properties/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  
  req.db.info_table.destroy({ id })
      .then(properties => {
          res.send(properties);
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

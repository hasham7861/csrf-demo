const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'csrf-demo-secret',
  resave: false,
  saveUninitialized: true
}));

// Simulated user database
const USERS = {
  alice: { password: 'password', balance: 100 }
};

// Login page
app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input name="username" placeholder="Username" />
      <input name="password" placeholder="Password" type="password" />
      <button>Login</button>
    </form>
  `);
});

// Login handler
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];
  if (user && user.password === password) {
    req.session.user = username;
    res.redirect('/account');
  } else {
    res.send('Invalid login');
  }
});

// Protected account page
app.get('/account', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  res.send(`
    <h2>Welcome, ${user}</h2>
    <p>Balance: $${USERS[user].balance}</p>
    <form method="POST" action="/transfer">
      <input name="amount" placeholder="Amount" />
      <button>Transfer to attacker</button>
    </form>
  `);
});

// Simulate a transfer
app.post('/transfer', (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).send('Unauthorized');
  const amount = parseInt(req.body.amount, 10);
  USERS[user].balance -= amount;
  res.send(`<p>Transferred $${amount} to attacker. <a href="/account">Back</a></p>`);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

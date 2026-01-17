const express = require('express');
const app = express();
const PORT = 3000;
const { requiresAuth } = require('express-openid-connect');
const { auth } = require('express-openid-connect');

const apiRoute = require("./routes/api");
const downloadRoute = require("./routes/download");
app.use("/api", apiRoute);
app.use("/download", downloadRoute);

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'UDOXinuXS2Y3my5bA4m5fFTjR1u8gUjh',
  issuerBaseURL: 'https://dev-xhzkcvi6sx8wdoqc.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use(express.json());
app.use(express.static('public'));


app.get('/profile', requiresAuth(), (req, res) => {
  res.send(req.oidc.user);
});

app.listen(PORT, () => {
  console.log(`Server pokrenut na vratima: ${PORT}`);
});

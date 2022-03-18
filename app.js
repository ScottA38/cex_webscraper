const path = require("path");
const functions = require("./src/lib/functions")
const express = require("express");
const winston = require('winston');
const expressWinston = require('express-winston');

const app = express();
const port = process.env.PORT || "8000";

app.set("views", path.join(__dirname, "views"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, "public")));
app.use(expressWinston.logger({
  transports: [
   new winston.transports.Console()
  ],
  format: winston.format.combine(
   winston.format.colorize(),
   winston.format.json()
  ),
  expressFormat: true, // Use the default Express/morgan request formatting.
  // Enabling this will override any msg if true.
  // Will only output colors with colorize set to true
  colorize: true,
  ignoreRoute: function (req, res) { return true; }
}));
app.use(expressWinston.errorLogger({
  transports: [
   new winston.transports.Console()
  ],
  format: winston.format.combine(
   winston.format.colorize(),
   winston.format.json()
  )
 }));
app.use(express.json());


app.get("/", function (req, res) {
  res.render("index", {});
});

app.get("/findTitle", function(req, res) {
  let title = req.query.title;
  let postcode = req.query.postcode;
  if (!title) {
    res.status(400).send('Missing title parameter')

    return false;
  }

  functions.getData(title, true)
  .then(function(resp) {
    return res.json((JSON.parse(resp) ?? {}));
  })
  .catch(function (err) {
    return res.status(500).send(err.message);
  });
})

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
})

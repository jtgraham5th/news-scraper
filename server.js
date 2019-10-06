// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");
// var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

var models = require("./models");

// Initialize Express
var app = express();
var PORT = process.env.PORT || 8080;

app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Database configuration
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = "mongodb://dbuser:dbpassword@ds229108.mlab.com:29108/heroku_mrcbt5zx";



// Hook mongojs configuration to the db variable
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(db, function (error) {
  if (error) {
    console.log("Database Error:", error);
  } else {
    console.log("Mongoose connection is successful")
  }
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/articles", function (req, res) {
  // Find all results from the scrapedData collection in the db
  models.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
  });

  // Scrape data from one site and place it into the mongodb db
  app.get("/scrape", function (req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://www.espn.com/nfl/").then(function (response) {
      // Load the html body from axios into cheerio
      var $ = cheerio.load(response.data);
      // For each article element that has a section and  'a' class
      $("article section a").each(function (i, element) {
          // console.log(i);
          // console.log(element);
        var result = {}

        result.title = $(this).find(".contentItem__title").text();
        result.link = $(this).attr("href");
        console.log(result)

        models.Article.create(result)
          .then(function (dbArticle) {
            console.log(dbArticle);
          })
          .catch(function (err) {
            console.log(err);
          });
        });
        // Send a "Scrape Complete" message to the browser
        res.send("Scrape Complete");
      });
    });

      // Listen on port 3000
      app.listen(PORT, function () {
        console.log("App running on port 8080!", PORT, PORT);
      });

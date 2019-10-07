// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");
var path = require("path");
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

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Database configuration
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];
app.use(express.static(path.join(__dirname, "../public")));
app.use("/:id/articles", express.static(path.join(__dirname, "public")));

// app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI =
  "mongodb://dbuser:dbpassword@ds229108.mlab.com:29108/heroku_mrcbt5zx";

// Hook mongojs configuration to the db variable
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(db, function(error) {
  if (error) {
    console.log("Database Error:", error);
  } else {
    console.log("Mongoose connection is successful");
  }
});
// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.render("index");
  // res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Retrieve data from the db
app.get("/:id/articles", function(req, res) {
  // Find all results from the scrapedData collection in the db
  models.Article.find({ sport: req.params.id })
    .then(function(dbArticle) {
      if (dbArticle.length === 0) {
        res.render("index", { sport: req.params.id });
      } else {
        res.render("index", {
          articles: dbArticle,
          sport: dbArticle[0].sport
        });
      }
      // res.json(dbArticle);
    })

    .catch(function(err) {
      res.json(err);
    });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape/:id", function(req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios
    .get("https://www.espn.com/" + req.params.id + "/")
    .then(function(response) {
      // Load the html body from axios into cheerio
      var $ = cheerio.load(response.data);
      // For each article element that has a section and  'a' class
      $("article section a").each(function(i, element) {
        // console.log(i);
        // console.log(element);
        var result = {};

        result.title = $(this)
          .find(".contentItem__title")
          .text();
        result.link = $(this).attr("href");
        result.sport = req.params.id;
        console.log(result);

        models.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            console.log(err);
          });
      });
      // Send a "Scrape Complete" message to the browser

      res.redirect("/" + req.params.id + "/articles");
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  models.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    // .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  models.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return models.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { note: dbNote } },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/notes/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  models.Note.find({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 8080!", PORT, PORT);
});

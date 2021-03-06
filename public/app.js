// $(".btn-success").on("click", function() {
//   var thisSport = $(this).attr("data-name");
//   // Grab the articles as a json
// $.getJSON("/" + thisSport + "/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p class='border h3' data-id='" + data[i]._id + "'>" + data[i].title + "<br /><a class='h6' href='https://www.espn.com" + data[i].link + "'> https://www.espn.com" + data[i].link + "</p>");
//   }
// });
// });


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log(thisId)

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      for (var i = 0; i < data.note.length; i++) {
        $("#notes").append("<div data-id='" + data.note[i]._id + "'><b>" + data.note[i].title + " </b><div>" + data.note[i].body + "</div></div>");
        
        // Place the title of the note in the title input
        // $("#titleinput").val(data.note[i].title);
        // // Place the body of the note in the body textarea
        // $("#bodyinput").val(data.note[i].body);
      }
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      console.log(data.note);
      // If there's a note in the article
      
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val(),
      article: thisId
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

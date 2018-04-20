const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      sqlite3 = require('sqlite3').verbose(),
      app = express();
      fetch = require("node-fetch");
      // https = require("https"),
      // http = require("http");

var db = new sqlite3.Database('./db/database.db');
let sql = `SELECT * FROM films LIMIT 3`;
;

const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;



// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });


// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);
app.get('/allfilm', allFilm);
app.get('/films/:id/allreviews', allReviews);

// ROUTE HANDLER
function getFilmRecommendations(req, res) {
  db.all(`SELECT
    release_date, genre_id, title
    FROM films
    WHERE id=${req.params.id}`,
      // release_date > 20030000
    [], (err, films) => {
      // films.genre_id=${films.genre_id}
    if (err) {
      throw err;
    }
    films.forEach((films) => {
      if (films.release_date )
      console.log('file date:', films.release_date);
      // if ()
    });
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json( {recommendations: films, meta: { limit: 10, offset: 0 }});
  });
}

function allReviews(req, res) {
  const film_Id = req.params.id;
  var url = `http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1?films=${film_Id}`
  fetch(url)
    .then(response => {
      response.json().then(json => {
        var arr = [];
        json.forEach((show) => {
        console.log('length of reviews: ',show.reviews.length)

          if (show.reviews.length >= 5){
            arr.push(show);
            console.log('first rating is: ',arr[0].reviews[0].rating);
          }

        // arr.forEach((ratingOver4, index) =>{
          var rating_arr = [];
          console.log('first author:', arr[0].reviews[0].author)
          for(var i = 0; i< arr[0].reviews.length; i++){
          rating_arr.push(arr[0].reviews[i].rating)
        }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          console.log('sum is:', rating_arr)
          var totalRating = rating_arr.reduce(reducer)/arr[0].reviews.length;
          console.log('average:', totalRating)


        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({arr, meta: { limit: 5, offset: 0 }});
      })
    })
      })
      .catch(error => {
        console.log(error);
      });
    }



// function allReviews(req, res) {
//   const film_Id = req.params.id;
//   var url = `http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1?films=${film_Id}`
//   request.get(url, [], (error, response, body) => {
//     console.log(body);
//
//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json({body, meta: { limit: 10, offset: 0 }});
//   });
// }

function allFilm(req, res) {
  db.all(sql, [], (err, films) => {
    if (err) {
      throw err;
    }
    films.forEach((films) => {
      console.log('getting film');
    });
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json( {recommendations: films, meta: { limit: 10, offset: 0 }});
  });
db.close();


  // res.setHeader('Content-Type', 'application/json');
  // res.status(200).json( {recommendations:[], meta: { limit: 10, offset: 0 }});

}

module.exports = app;

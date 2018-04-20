const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      sqlite3 = require('sqlite3').verbose(),
      app = express();
      fetch = require("node-fetch");


var db = new sqlite3.Database('./db/database.db');
let sql = `SELECT * FROM films LIMIT 3`;

const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;



// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });


// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);
app.get('/films/:id', allFilm);
app.get('/films/:id/allreviews', allReviews);

app.get('*', function(req, res) {
   res.status(404).json({message: "Return an explicit error here"});
 });
// `SELECT release_date, genre_id, title FROM films WHERE id=${req.params.id}`
// films.genre_id=${films.genre_id}

// ROUTE HANDLER
function getFilmRecommendations(req, res) {
  var sql2 = `
  SELECT films.id, films.release_date, films.genre_id, films.title, genres.name
  FROM films
  JOIN genres
  WHERE films.genre_id=genres.id
  ORDER BY films.id
  LIMIT 3
  `
  var sql3 = `
  SELECT films.id, films.release_date, films.genre_id, films.title
  FROM films
  INNER JOIN genres ON (films.genre = genres.name)
  WHERE films.genre_id=genres.id
  ORDER BY films.id
  LIMIT 3
  `

  db.all(sql2, [], (err, films) => {
    if (err) {
      throw err;
    }
    films.forEach((films) => {
      // console.log('getting film');
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
          console.log('sum is:', rating_arr);
          var totalRating = rating_arr.reduce(reducer)/arr[0].reviews.length;
          console.log('average:', totalRating);
          var totalReviews = arr[0].reviews.length;
          console.log('Total Reviews:', totalReviews);

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({arr, meta: { limit: 5, offset: 0 }});
        })
      })
    })
      .catch(error => {
        console.log(error);
        res.status(404).json("error")
      });
    }



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
}


module.exports = app;

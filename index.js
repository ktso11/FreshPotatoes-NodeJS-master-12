const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      sqlite3 = require('sqlite3').verbose(),
      app = express();
      fetch = require("node-fetch");


var db = new sqlite3.Database('./db/database.db');
// let sql = `SELECT * FROM films LIMIT 3`;

const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;



// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });


// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);
app.get('/films/', allFilm);
app.get('/films/:id/test', test);
app.get('/films/:id/allreviews', allReviews);
app.get('*', function(req, res) {
   res.status(404).json({message: "Return an explicit error here"});
 });
// `SELECT release_date, genre_id, title FROM films WHERE id=${req.params.id}`
// films.genre_id=${films.genre_id}

// ROUTE HANDLER
function getFilmRecommendations(req, res) {
  var sql2 = `
  SELECT films.id, films.title, films.release_date, films.genre_id, genres.name
  FROM films
  JOIN genres
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
        console.log('length of reviews: ',show.reviews.length )

          if (show.reviews.length >= 5){
            arr.push(show);
            console.log('first rating is: ',arr[0].reviews[0].rating);
          }
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
  var sql = `SELECT *
  FROM films

  LIMIT 10`
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

function test(req, res) {
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

          // var parent = `SELECT * FROM films WHERE id=${req.params.id}`
          // db.get(parent, [], err, respond)=>{
          //   if (err) {
          //     throw err;
          //   }
          // }

          var sql3 = `
          SELECT films.id, films.title, films.release_date, films.genre_id
          FROM films
          WHERE films.genre_id=19
          ORDER BY films.id
          LIMIT 3
          `

          // SELECT films.id, films.title, films.release_date, films.genre_id, genres.name
          // FROM films
          // JOIN genres
          // WHERE films.genre_id=genres.id AND films.id=${req.params.id}
          // ORDER BY films.id

          db.all(sql3, [], (err, films) => {
            if (err) {
              throw err;
            }
            var finalRec = [];
              console.log('films length:', films.length)
            for(var i = 0; i< films.length; i++){

              var recommend = {
                id: films[i].id,
                title: films[i].title,
                releaseDate: films[i].release_date,
                genre: films[i].name,
                averageRating: totalRating,
                reviews: totalReviews
                }

                finalRec.push(recommend);
                // console.log(finalRec);
              }

            res.setHeader('Content-Type', 'application/json');
            res.status(200).json( {recommendations: finalRec, meta: { limit: 10, offset: 0 }});
          });
        })
      })
    })
      .catch(error => {
        console.log(error);
        res.status(404).json("error")
      });
    }


module.exports = app;

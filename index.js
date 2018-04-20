const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      sqlite3 = require('sqlite3').verbose(),
      app = express();
      fetch = require("node-fetch");


var db = new sqlite3.Database('./db/database.db');
const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;



// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });


// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);
app.get('/films/:id', allFilm);
// app.get('/films/:id/test', test);
app.get('/films/:id/allreviews', allReviews);
app.get('*', function(req, res) {
   res.status(404).json({message: "Return an explicit error here"});
 });

 const BAD_REQUEST = '"message" missing key';

// ROUTE HANDLER
// function getFilmRecommendations(req, res) {
//   var sql2 = `
//   SELECT films.id, films.title, films.release_date, films.genre_id, genres.name
//   FROM films
//   JOIN genres
//   WHERE films.genre_id=genres.id
//   ORDER BY films.id
//   LIMIT 3
//   `
//
//   db.all(sql2, [], (err, films) => {
//     if (err) {
//       throw err;
//     }
//     films.forEach((films) => {
//     });
//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json( {recommendations: films, meta: { limit: 10, offset: 0 }});
//   });
// }

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
    //     })
    //   })
    // })

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



function allFilm(id) {
  var sql = `SELECT * FROM films WHERE id=${req.params.id}`
  db.get(sql, [], (err, parent) => {
    if (err) {
      throw err;
    }
    console.log('thi is inside the function',parent);
  });
}



function getFilmRecommendations(req, res) {
  var sql = `SELECT * FROM films WHERE id=${req.params.id}`
  db.get(sql, [], (err, parent) => {
    if (err) {
      res.status(422).json({
        message: BAD_REQUEST
      });
    }
      var sql3 = `
      SELECT films.id, films.title, films.release_date, films.genre_id
      FROM films
      WHERE films.genre_id = ${parent.genre_id}
      ORDER BY films.id
      LIMIT 3
      `
          db.all(sql3,[], (err, films) => {
            if (err) {
              // throw err;
              res.status(404).json(json({
                message: BAD_REQUEST
              }))
            }

             var finalRec = [];
             console.log('films id#################:', films.id)
             for(var i = 0; i< films.length; i++){

               const film_Id = films[i].id;
               var url = `http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1?films=${film_Id}`
               fetch(url)
                 .then(response => {
                   response.json().then(json => {
                     var arr = [];
                     var rating =[]
                     var averag =[]
                     json.forEach((show) => {
                       // console.log('all reviews', show)
                       console.log('length of reviews: ',show.reviews.length )
                       if (show.reviews.length >= 5){
                         arr.push(show);
                       }
                       var rating_arr = [];
                       for(var i = 0; i< arr[0].reviews.length; i++){
                         rating_arr.push(arr[0].reviews[i].rating)
                         // console.log('hello',arr[i].reviews[2])
                        }

                       const reducer = (accumulator, currentValue) => accumulator + currentValue;
                       console.log('sum is:', rating_arr);
                       var totalRating = rating_arr.reduce(reducer)/arr[0].reviews.length;
                       console.log('average:', totalRating);

                       var totalReviews = arr[0].reviews.length;
                       averag.push(totalReviews)
                       rating.push(totalRating)
                       console.log('Total Reviews Array:', averag);
                       console.log('total average rating array:',rating)
                     })

                   })

                 });

                 console.log('made it to here')
                 for(var i = 0; i< films.length; i++){
                    console.log('lalal', films[2].id)
                 var recommend = {
                   id: films[i].id,
                   title: films[i].title,
                   releaseDate: films[i].release_date,
                   genre: films[i].name
                   // averageRating: rating[i],
                   // reviews: averag[i]
                   }
                   finalRec.push(recommend);
                       console.log('final array',finalRec)
              }
            }

             res.setHeader('Content-Type', 'application/json');
            res.status(200).json( {recommendations: finalRec, meta: { limit: 10, offset: 0 }});
           })
        });
      }



module.exports = app;

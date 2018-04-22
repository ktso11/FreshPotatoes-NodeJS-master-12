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
// app.get('/films/:id', allFilm);
// app.get('/films/:id/test', test);
// app.get('/films/:id/allreviews', allReviews);
app.get('*', function(req, res) {
   res.status(404).json({message: "Return an explicit error here"});
 });

 const BAD_REQUEST = '"message" missing key';

// ROUTE HANDLER



function getFilmRecommendations(req, res) {
  var sql = `SELECT * FROM films WHERE id=${req.params.id}`
  db.get(sql, [], (err, parent) => {
    if (err) {
      res.status(422).json({
        message: BAD_REQUEST
      });
    }
      var sql3 = `
      SELECT films.id, films.title, films.release_date, films.genre_id ,name
      FROM films,genres
      WHERE films.genre_id = ${parent.genre_id} and films.genre_id = genres.id AND films.id <> ${parent.id}
      ORDER BY films.id
      LIMIT 60
      `
      db.all(sql3,[], (err, films) => {
        if (err) {
          res.status(404).json(json({
            message: BAD_REQUEST
          }))
        }
          var finalRec = [];
          let filteredFilm= films.filter( film => Math.abs((Date.parse(film.release_date)-Date.parse(parent.release_date))/1000/3600/24/365)<=15)
          stop =0;
           let ids =''
          for(let i = 0; i< filteredFilm.length; i++){
            var url = `http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1?films=${filteredFilm[i].id}`
            fetch(url)
              .then(response => {
                  response.json().then(json => {
                    if(json[0].reviews.length >= 5 ){
                      let sum=0;
                    for(let j=0;j<json[0].reviews.length;j++){
                      sum += json[0].reviews[j].rating;
                    }
                      let average= sum/json[0].reviews.length;
                      let reviewnum = json[0].reviews.length;
                      if(average >= 4){
                        var recommend = {
                          id: filteredFilm[i].id,
                          title: filteredFilm[i].title,
                          releaseDate: filteredFilm[i].release_date,
                          genre: filteredFilm[i].name,
                          averageRating: parseFloat((average).toFixed(2)),
                          reviews: reviewnum
                        }
                      finalRec.push(recommend);
                      }
                    }
                    if( stop == filteredFilm.length-1){
                      if (req.query.limit == null) {
                        defaultLimit = 10
                      } else {
                        defaultLimit = req.query.limit;
                      }
                      if (req.query.offset == null) {
                        defaultoffset = 0
                      } else {
                        defaultoffset = req.query.offset;
                      }
                      res.setHeader('Content-Type', 'application/json');
                      res.status(200).json( {recommendations: finalRec.slice(defaultoffset,defaultLimit), meta: { limit: defaultLimit, offset: defaultoffset }});
                    }
                    stop++;
                  })
                })
              }
           })
        });
      }



module.exports = app;

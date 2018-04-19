const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      sqlite3 = require('sqlite3').verbose(),
      app = express();
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
    WHERE id=${req.params.id}`, [], (err, films) => {
      // films.genre_id=${films.genre_id}
    if (err) {
      throw err;
    }
    films.forEach((films) => {
      console.log(films.release_date);
      // if ()
    });
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json( {recommendations: films, meta: { limit: 10, offset: 0 }});
  });
}

function allReviews(req, res) {
  const film_Id = req.params.id;
  var url = `http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1?films=${film_Id}`
  request.get(url, [], (error, response, body) => {
    console.log(body);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({body, meta: { limit: 10, offset: 0 }});
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
db.close();


  // res.setHeader('Content-Type', 'application/json');
  // res.status(200).json( {recommendations:[], meta: { limit: 10, offset: 0 }});

}

module.exports = app;

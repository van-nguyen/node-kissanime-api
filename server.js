const express = require('express');

const Anime = require('anime-scraper').Anime;

const app = express();
const baseUrl = 'https://kissanime.to';

Anime.search('overlord').then(animes => {
  console.log(animes);
});

// app.get('/search/:name', function (req, res) {
//   Anime.search(req.params.name).then(animes => {
//     console.log(animes);
//   });
// });

app.get('/get/:name', (req, res) => {
  Anime.fromUrl(baseUrl + '/Anime/' + req.params.name).then(anime => {
    anime.episodes[0].get(video => {
      res.send(video);
    });
  });
});

app.listen(3000);

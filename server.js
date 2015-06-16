var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var cloudscraper = require('cloudscraper');
var AnimeUtils = require('anime-scraper').AnimeUtils;
var Anime = require('anime-scraper').Anime;

/*
* Default port wich the API server will run.
*/
var defaultPort = 80;

var app = express();

console.log("Retrieving CloudFlare cookie...");
cloudscraper.get('http://kissanime.com', function(err, body, resp) {
	var cookieString = resp.request.headers.cookie;
	AnimeUtils.setSessionCookie(cookieString);

	app.get('/', function(req, res) {
		res.type('text/plain');
		res.send('API is running.');
	});

	/*
	* Search on KissAnime with given :name string
	* :name (required) = search term
	* http://localhost/search/death note
	*/
	app.get('/search/:name', function(req, res) {
		var animeName = req.params.name;
		AnimeUtils.searchByName(animeName).then(function(results) {
		    res.type('json');
			for (var i in results) {
				results[i].shortUrl = results[i].url.replace("http://kissanime.com/Anime/", "");
			}
			console.log('/search/'+animeName);
			res.send(results);
		})
	});

	/*
	* Get Anime info and/or episodes by name
	* :name (required) 		= full anime name (Example: Naruto Shippuuden (Dub))
	* :filter (optional) 	= info, episodes
	* http://localhost/getAnimeByName/Death Note (Sub)/info
	*/	
	app.get('/getAnimeByName/:name/:filter*?', function(req, res) {
		var animeName 	= req.params.name;
		var filter 		= req.params.filter;
		Anime.fromName(animeName).then(function(anime) {
			res.type('json');
		  	if (filter === "info") {
		  		console.log('/getAnimeByName/'+animeName+'/'+filter);
		  		return res.send(anime.info);
		  	}
		  	else if (filter === "episodes") {
		  		console.log('/getAnimeByName/'+animeName+'/'+filter);
				return res.send(anime.episodes);
		  	}
		  	else{
		  		console.log('/getAnimeByName/'+animeName);
		  		return res.send(anime);
		  	};
		})
	})

	/*
	* Get Anime info and/or episodes by shortUrl
	* :name (required) 		= shortUrl
	* :filter (optional) 	= info, episodes
	* http://localhost/getAnimeByUrl/Death-Note/info
	*/
	app.get('/getAnimeByUrl/:name/:filter*?', function(req, res) {
		var animeName 	= req.params.name;
		var filter 		= req.params.filter;
		Anime.fromUrl('http://kissanime.com/Anime/'+animeName).then(function(anime) {
			res.type('json');
			if (filter === "info") {
				console.log('/getAnimeByUrl/'+animeName+'/'+filter);
		  		return res.send(anime.info);
		  	}
		  	else if (filter === "episodes") {
		  		console.log('/getAnimeByUrl/'+animeName+'/'+filter);
				return res.send(anime.episodes);
		  	}
		  	else{
		  		console.log('/getAnimeByUrl/'+animeName);
		  		return res.send(anime);
		  	};
		})
	})

	/*
	* Get Anime episode link by shortUrl
	* :name (required) 		= shortUrl
	* :filter (optional) 	= info, episode
	* :quality (optional)	= available episode quality (Example: 720p)
	* http://localhost/getVideoByUrl/Death-Note
	* http://localhost/getVideoByUrl/Death-Note/5
	* http://localhost/getVideoByUrl/Death-Note/5/720p (note: if given quality is not found, return all qualities)
	*/
	app.get('/getVideoByUrl/:name/:filter*?/:quality*?', function(req, res) {
		var animeName 	= req.params.name;
		var filter		= req.params.filter;
		var quality		= req.params.quality;
		Anime.fromUrl('http://kissanime.com/Anime/'+animeName).then(function(anime) {
			res.type('json');
			if (isNaN(filter) === false) {
				anime.episodes[filter].getVideoUrl().then(function (results) {
					if (quality != "") {
						for (var i in results) {
							if (quality == "/"+results[i]['name']) {
								console.log('/getVideoByUrl/'+animeName+'/'+filter+'/'+quality);
								return res.send(results[i]);
							};
						}
						console.log('/getVideoByUrl/'+animeName+'/'+filter+'/'+quality);
						return res.send(results);
					}
					else {
						console.log('/getVideoByUrl/'+animeName+'/'+filter);
						return res.send(results);
					};
				})
			}
			else{
				anime.getVideoUrls().then(function(results) {
					console.log('/getVideoByUrl/'+animeName);
					return res.send(results);
				})
			};
		})
	})

	console.log("Ready, listening on port "+defaultPort+".");
});

/*
* Generate new CloudFlare cookie
* http://localhost/cookie
*/
app.get('/cookie', function(req, res) {
	cloudscraper.get('http://kissanime.com', function(err, body, resp) {
		var newString = resp.request.headers.cookie;
		var json = {"cookie": newString}
		res.type('json');
		console.log('/cookie/'+newString);
		res.send(json);
	});
});
app.listen(process.env.PORT || defaultPort);
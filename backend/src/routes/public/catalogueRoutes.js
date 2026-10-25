const express = require('express');
const movieController = require('../../controllers/movies/movieController');
const cinemaController = require('../../controllers/cinemas/cinemaController');
const showController = require('../../controllers/shows/showController');
const seatController = require('../../controllers/shows/seatController');

const router = express.Router();

router.get('/movies', movieController.listPublicMovies);
router.get('/movies/:movieId', movieController.getPublicMovie);
router.get('/cinemas', cinemaController.listPublicCinemas);
router.get('/cinemas/:cinemaId', cinemaController.getPublicCinema);
router.get('/cinemas/:cinemaId/screens', cinemaController.listPublicScreens);
router.get('/shows', showController.listPublicShows);
router.get('/shows/:showId/seats', seatController.listShowSeats);
router.get('/shows/:showId', showController.getPublicShow);

module.exports = router;


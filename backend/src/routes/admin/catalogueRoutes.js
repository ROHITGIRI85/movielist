const express = require('express');
const authenticate = require('../../middleware/auth/authenticate');
const requireRole = require('../../middleware/auth/requireRole');
const validate = require('../../middleware/validation/validate');
const { ROLES } = require('../../constants/roles');
const movieController = require('../../controllers/movies/movieController');
const cinemaController = require('../../controllers/cinemas/cinemaController');
const showController = require('../../controllers/shows/showController');
const {
  validateMovieCreate,
  validateMovieUpdate,
  validateCinemaCreate,
  validateCinemaUpdate,
  validateScreenCreate,
  validateScreenUpdate,
  validateShowCreate,
  validateShowUpdate,
} = require('../../validators/catalogue/catalogueValidators');

const router = express.Router();

router.use(authenticate, requireRole(ROLES.ADMIN));

router.route('/movies').get(movieController.listAdminMovies).post(validate(validateMovieCreate), movieController.createMovie);
router
  .route('/movies/:movieId')
  .get(movieController.getAdminMovie)
  .patch(validate(validateMovieUpdate), movieController.updateMovie)
  .delete(movieController.archiveMovie);

router.route('/cinemas').get(cinemaController.listAdminCinemas).post(validate(validateCinemaCreate), cinemaController.createCinema);
router
  .route('/cinemas/:cinemaId')
  .patch(validate(validateCinemaUpdate), cinemaController.updateCinema)
  .delete(cinemaController.deactivateCinema);
router
  .route('/cinemas/:cinemaId/screens')
  .get(cinemaController.listAdminScreens)
  .post(validate(validateScreenCreate), cinemaController.createScreen);
router
  .route('/screens/:screenId')
  .patch(validate(validateScreenUpdate), cinemaController.updateScreen)
  .delete(cinemaController.deactivateScreen);

router.route('/shows').get(showController.listAdminShows).post(validate(validateShowCreate), showController.createShow);
router
  .route('/shows/:showId')
  .patch(validate(validateShowUpdate), showController.updateShow)
  .delete(showController.cancelShow);

module.exports = router;


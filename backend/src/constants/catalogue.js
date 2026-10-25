const MOVIE_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

const SHOW_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

const SHOW_FORMATS = Object.freeze(['2D', '3D', 'IMAX', '4DX']);
const SEAT_CATEGORIES = Object.freeze(['standard', 'premium', 'recliner', 'accessible']);

module.exports = {
  MOVIE_STATUS,
  MOVIE_STATUS_VALUES: Object.values(MOVIE_STATUS),
  SHOW_STATUS,
  SHOW_STATUS_VALUES: Object.values(SHOW_STATUS),
  SHOW_FORMATS,
  SEAT_CATEGORIES,
};


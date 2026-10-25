const mongoose = require('mongoose');

const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];

const getHealth = (req, res) => {
  const databaseState = stateNames[mongoose.connection.readyState] || 'unknown';
  const ready = mongoose.connection.readyState === 1;

  res.status(ready ? 200 : 503).json({
    success: ready,
    data: {
      service: 'imovies-api',
      status: ready ? 'ready' : 'not_ready',
      database: databaseState,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = { getHealth };


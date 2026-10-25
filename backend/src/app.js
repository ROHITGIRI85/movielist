const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { env } = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middleware/errors/notFound');
const errorHandler = require('./middleware/errors/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
const corsOptions = {
  origin(origin, callback) {
    if (!origin || origin === env.clientUrl) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') app.use(morgan('dev'));

app.use('/api/v1', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;


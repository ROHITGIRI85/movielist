const logger = {
  info(message, metadata = {}) {
    console.info(message, metadata);
  },
  error(message, metadata = {}) {
    console.error(message, metadata);
  },
};

module.exports = logger;


export default {
  log: (logMessage) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(logMessage);
    }
  },
  logError: (logErrorMessage) => {
    console.error(logErrorMessage);
  },
};


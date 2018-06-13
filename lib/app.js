const express = require('express');
const cors = require('cors');
const config = require('./config');
const { user } = require('./middlewares');
const { fileLogger, stdoutLogger } = require('./logger');

const app = express();

// Apply CORS middleware
app.use(cors());

// Apply logger middleware
app.use(fileLogger);
app.use(stdoutLogger);

// Song Metadata API
app.get('/user/:id', user);

// Catch all other requests
app.get('*', (request, response) => {
  response.status(404).send('Route not found');
});

app.listen(config.port, () => {
  console.log(`Node-server start to listen on port ${config.port}..`);
});

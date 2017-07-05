import express from 'express';
import cors from 'cors';
import userMiddleware from './entries/user';
import config from './config';
import { fileLogger, stdoutLogger } from './logger';

const app = express();

// Apply CORS middleware
app.use(cors());

// Apply logger middleware
app.use(fileLogger);
app.use(stdoutLogger);

// Song Metadata API
app.get('/user/:id', userMiddleware);
// Catch all other requests
app.get('*', (request, response) => {
  response.status(404).send('Route not found');
});

app.listen(config.port, () => {
  console.log(`Node-server start to listen on port ${config.port}..`);
});

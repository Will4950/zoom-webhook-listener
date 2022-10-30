import logger from './logger.js';
import router from './router.js';
import express from 'express';
import expressWinston from 'express-winston';
import favicon from 'serve-favicon';
const app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.set('query parser', 'simple');
app.set('x-powered-by', false);

app.use(expressWinston.logger({winstonInstance: logger, level: 'http'}));
app.use(favicon('public/favicon.ico'));
app.use(router);

export default app;

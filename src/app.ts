import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import Logger from './core/Logger';
import cors from 'cors';
import { corsUrl, environment } from './config';
import './database'; // initialize database
import { NotFoundError, ApiError, InternalError } from './core/ApiError';
import routesV1 from './routes/v1';

process.on('uncaughtException', (e) => {
  Logger.error(e);
});

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }));
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

// log all http responses to console
app.use(morgan('dev'));

// Home Routes
app.get('/', (_req, res) => res.send('Ok'));

// Routes
app.use('/v1', routesV1);

// catch 404 and forward to error handler
app.use((_req, _res, next) => next(new NotFoundError()));

// Middleware Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
  } else {
    if (environment === 'development') {
      Logger.error(err);
      return res.status(500).send(err.message);
    }
    ApiError.handle(new InternalError(), res);
  }
});

export default app;

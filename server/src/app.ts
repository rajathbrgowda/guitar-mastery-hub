import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import healthRouter from './routes/health.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/health', healthRouter);

export default app;

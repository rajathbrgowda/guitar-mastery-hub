import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import healthRouter from './routes/health';
import progressRouter from './routes/progress';
import practiceRouter from './routes/practice';
import resourcesRouter from './routes/resources';
import analyticsRouter from './routes/analytics';
import usersRouter from './routes/users';
import curriculumRouter from './routes/curriculum';
import practicePlanRouter from './routes/practice-plan';
import milestonesRouter from './routes/milestones';
import { errorHandler } from './middleware/error';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());

// Public
app.use('/api/health', healthRouter);

// Protected — requireAuth applied inside each router
app.use('/api/progress', progressRouter);
app.use('/api/practice/plan', practicePlanRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/analytics', analyticsRouter); // includes /api/analytics/insights
app.use('/api/users', usersRouter);
app.use('/api/curriculum', curriculumRouter);
app.use('/api/milestones', milestonesRouter);

app.use(errorHandler);

export default app;

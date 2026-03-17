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
import roadmapRouter from './routes/roadmap';
import masteryRouter from './routes/mastery';
import toolsRouter from './routes/tools';
import publicStatsRouter from './routes/public-stats';
import publicMilestonesRouter from './routes/public-milestones';
import bpmRouter from './routes/bpm';
import recordingsRouter from './routes/recordings';
import { errorHandler } from './middleware/error';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());

// Public
app.use('/api/health', healthRouter);
app.use('/api/public/stats', publicStatsRouter);
app.use('/api/public/milestones', publicMilestonesRouter);

// Protected — requireAuth applied inside each router
app.use('/api/progress', progressRouter);
app.use('/api/practice/plan', practicePlanRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/analytics', analyticsRouter); // includes /api/analytics/insights + /confidence-trends
app.use('/api/analytics/bpm', bpmRouter);
app.use('/api/users', usersRouter);
app.use('/api/curriculum', curriculumRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/mastery', masteryRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/skills', recordingsRouter);

app.use(errorHandler);

export default app;

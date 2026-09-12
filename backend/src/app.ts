import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

import stopsRouter from './routes/stops';
import routesRouter from './routes/routes';
import searchRouter from './routes/search';
import tripsRouter from './routes/trips';
import adminAuthRouter from './routes/admin/auth';
import adminBusesRouter from './routes/admin/buses';
import adminRoutesRouter from './routes/admin/routes';
import adminStopsRouter from './routes/admin/stops';
import adminTripsRouter from './routes/admin/trips';
import adminDelaysRouter from './routes/admin/delays';
import adminImportRouter from './routes/admin/import';
import adminDashboardRouter from './routes/admin/dashboard';
import feedbackRouter from './routes/feedback';

try {
  require('dotenv').config();
} catch (e) {
  // dotenv not needed in Next.js environment
}

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000
});
app.use(limiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/stops', stopsRouter);
app.use('/api/routes', routesRouter);
app.use('/api/search', searchRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/feedback', feedbackRouter);

// Admin
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/buses', adminBusesRouter);
app.use('/api/admin/routes', adminRoutesRouter);
app.use('/api/admin/stops', adminStopsRouter);
app.use('/api/admin/trips', adminTripsRouter);
app.use('/api/admin/delays', adminDelaysRouter);
app.use('/api/admin/import', adminImportRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);

app.use(errorHandler);

export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
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

dotenv.config();

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

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  // In production, auto-apply DB schema and seed on first start
  if (process.env.NODE_ENV === 'production') {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prismaCheck = new PrismaClient();
      // Ensure tables exist (db push equivalent via Prisma migrate deploy)
      await prismaCheck.$connect();
      const userCount = await prismaCheck.user.count().catch(() => 0);
      if (userCount === 0) {
        console.log('🌱 No data found — running seed...');
        await prismaCheck.$disconnect();
        // Import and run seed inline
        const seed = require('./seed');
        if (typeof seed.main === 'function') await seed.main();
        else if (typeof seed.default === 'function') await seed.default();
      } else {
        console.log(`✅ Database ready (${userCount} admin users found)`);
        await prismaCheck.$disconnect();
      }
    } catch (e: any) {
      console.log('ℹ️  Auto-seed skipped:', e?.message?.slice(0, 120) ?? String(e));
    }
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`🚌 WHERE IS MY BUS — Server running on port ${PORT}`));
}

bootstrap();



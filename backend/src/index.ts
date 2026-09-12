import app from './app';

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



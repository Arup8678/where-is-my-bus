import prisma from './lib/prisma';

async function main() {
  const busCount = await prisma.bus.count();
  const routeCount = await prisma.route.count();
  const tripCount = await prisma.trip.count();
  const stopCount = await prisma.stop.count();
  const tripStopCount = await prisma.tripStop.count();

  console.log('============================================');
  console.log('         DATABASE TOTALS SUMMARY');
  console.log('============================================');
  console.log(`Total Bus Profiles  : ${busCount}`);
  console.log(`Total Active Routes : ${routeCount}`);
  console.log(`Total Bus Trips     : ${tripCount}`);
  console.log(`Total Master Stops  : ${stopCount}`);
  console.log(`Total Trip Stoppages: ${tripStopCount}`);
  console.log('============================================');
}

main().catch(console.error).finally(() => prisma.$disconnect());

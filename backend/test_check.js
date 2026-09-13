require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tripStops = await prisma.tripStop.findMany({
    take: 20,
    include: { stop: true, trip: { include: { route: { include: { bus: true } } } } }
  });
  console.log('Sample TripStops:');
  tripStops.forEach(ts => {
    console.log(`Bus: ${ts.trip.route.bus.name} | Route: ${ts.trip.route.name} | Stop: ${ts.stop.name} | Seq: ${ts.sequence} | Scheduled: "${ts.scheduledTime}"`);
  });

  const tirumala = await prisma.bus.findFirst({
    where: { name: { contains: 'Tirumala', mode: 'insensitive' } },
    include: { routes: { include: { trips: { include: { stops: { include: { stop: true } } } } } } }
  });

  if (tirumala) {
    console.log('\n--- Tirumala Bus Details ---');
    console.log('Bus Name:', tirumala.name);
    tirumala.routes.forEach(r => {
      console.log('Route Name:', r.name);
      r.trips.forEach(t => {
        console.log('Trip ID:', t.id);
        t.stops.forEach(s => {
          console.log(`  Seq ${s.sequence}: ${s.stop.name} at ${s.scheduledTime}`);
        });
      });
    });
  } else {
    console.log('Tirumala bus not found!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

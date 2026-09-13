import dotenv from 'dotenv';
dotenv.config();
import { SearchEngine } from './src/services/searchEngine';
import prisma from './src/lib/prisma';

async function testSim() {
  console.log('--- Testing Search Silda -> Bankura ---');
  const results = await SearchEngine.search('Silda', 'Bankura');
  console.log(`Found ${results.length} bus(es) for Silda -> Bankura:`);
  results.forEach((r, idx) => {
    console.log(`\n[${idx + 1}] Bus: ${r.busName} | Status: ${r.status}`);
    console.log(`   From: ${r.fromStop.stopName} (${r.fromStop.scheduledTime}) -> To: ${r.toStop.stopName} (${r.toStop.scheduledTime})`);
    if (r.estimatedLocation) {
      console.log(`   Location: prev="${r.estimatedLocation.prevStopName}", next="${r.estimatedLocation.nextStopName}", progress=${(r.estimatedLocation.segmentProgress * 100).toFixed(1)}%`);
    } else {
      console.log(`   Location: None`);
    }
  });
}

testSim().catch(console.error).finally(() => prisma.$disconnect().then(() => process.exit(0)));

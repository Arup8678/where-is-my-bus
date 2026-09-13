require('dotenv').config();
const prisma = require('./src/lib/prisma').default || require('./src/lib/prisma');

async function cleanReturnNames() {
  console.log('Checking for [RETURN] in bus names and route names...');
  
  const buses = await prisma.bus.findMany({
    where: { name: { contains: '[RETURN]' } }
  });
  console.log(`Found ${buses.length} buses with [RETURN] in name.`);

  for (const bus of buses) {
    const cleanName = bus.name.replace(/\s*\[RETURN\]/gi, '').trim();
    console.log(`Updating Bus "${bus.name}" -> "${cleanName}"`);
    try {
      await prisma.bus.update({
        where: { id: bus.id },
        data: { name: cleanName }
      });
    } catch (e) {
      console.log(`Could not rename bus ${bus.id} to ${cleanName} (probably unique constraint). Updating bus ID/name with unique suffix.`);
      await prisma.bus.update({
        where: { id: bus.id },
        data: { name: `${cleanName} (Down)` }
      });
    }
  }

  const routes = await prisma.route.findMany({
    where: { name: { contains: '[RETURN]' } }
  });
  console.log(`Found ${routes.length} routes with [RETURN] in name.`);
  for (const r of routes) {
    const cleanRouteName = r.name.replace(/\s*\[RETURN\]/gi, '').trim();
    console.log(`Updating Route "${r.name}" -> "${cleanRouteName}"`);
    await prisma.route.update({
      where: { id: r.id },
      data: { name: cleanRouteName }
    });
  }

  console.log('Done cleaning return labels.');
}

cleanReturnNames().catch(console.error).finally(() => process.exit(0));

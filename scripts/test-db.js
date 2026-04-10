const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // Try to query a count from a model
    const userCount = await prisma.user.count();
    console.log("Database connection successful!");
    console.log(`Current users in DB: ${userCount}`);
    
    const tripCount = await prisma.trip.count();
    console.log(`Current trips in DB: ${tripCount}`);
    
    console.log("SUCCESS: Database is ready to store data.");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import {PrismaClient} from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient({
  log: ['error'],
});

export default prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
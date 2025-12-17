// src/lib/prisma.ts
import 'dotenv/config';            // ensure .env is loaded
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';  // postgres adapter

declare global {
  var prisma: PrismaClient | undefined;
}

// Create the adapter using the DB URL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// Instantiate PrismaClient with the adapter
export const client =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'], // optional logs
  });

// Prevent multiple instances in dev
if (process.env.NODE_ENV !== 'production') {
  global.prisma = client;
}

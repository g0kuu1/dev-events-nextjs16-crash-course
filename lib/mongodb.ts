import mongoose, { type Mongoose } from "mongoose";

const configuredMongoDbUri = process.env.MONGODB_URI;

if (!configuredMongoDbUri) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

const mongodbUri: string = configuredMongoDbUri;

interface MongooseCache {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

// Preserve the connection across Next.js hot reloads in development.
const cache =
  globalWithMongoose.mongooseCache ??
  (globalWithMongoose.mongooseCache = { connection: null, promise: null });

/** Connect to MongoDB and reuse the existing connection when available. */
export async function connectToDatabase(): Promise<Mongoose> {
  if (cache.connection) {
    return cache.connection;
  }

  // Store the in-flight promise so concurrent requests share one connection attempt.
  cache.promise ??= mongoose.connect(mongodbUri, { bufferCommands: false });

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    // Allow a later request to retry if the connection attempt fails.
    cache.promise = null;
    throw error;
  }
}

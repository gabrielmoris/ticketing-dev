import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

declare global {
  var signin: (id?: string) => string[];
}

jest.mock("../nats-wrapper.ts");

process.env.STRIPE_KEY = process.env.STRIPE_SECRET_FROM_ENV_FILE;

let mongo: any;

// Setup the in-memory mongo server before all tests
beforeAll(async () => {
  jest.clearAllMocks();
  process.env.JWT_KEY = "testkey";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri), {};
});

// Clear the database before each test
beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

// Close the mongoose connection after all tests
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Since I have not access to AUTH I build JWT Payload {id, email}
  const userId = id || new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id: userId,
    email: "em@il.com",
  };
  // Create a fake JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // Build a session object {jwt: MY_JWT}
  const session = { jwt: token };
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};

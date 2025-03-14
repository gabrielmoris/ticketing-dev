import express from "express";
import "express-async-errors"; // So I dont need to use next for async callbacks in the routes
import { json } from "body-parser";
import { errorHandler, NotFoundError, currentUser } from "@gcmlearn/common";
import cookieSession from "cookie-session";
import { createChargeRouter } from "./routes/new";

const app = express();
app.use(json());
app.set("trust proxy", true); // Trust the proxy from ingress-nginx
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);

app.use(currentUser);
app.use(createChargeRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

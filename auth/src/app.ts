import express from "express";
import "express-async-errors"; // So I dont need to use next for async callbacks in the routes
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
import { errorHandler, NotFoundError } from "@gcmlearn/common";
import cookieSession from "cookie-session";

const app = express();
app.use(json());
app.set("trust proxy", true); // Trust the proxy from ingress-nginx
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

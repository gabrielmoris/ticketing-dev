import express from "express";
import "express-async-errors"; // So I dont need to use next for async callbacks in the routes
import { json } from "body-parser";
import { errorHandler, NotFoundError, currentUser } from "@gcmlearn/common";
import cookieSession from "cookie-session";
import { deleteOrderRouter } from "./routes/delete";
import { indexOrderRouter } from "./routes";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";

const app = express();
app.use(json());
app.set("trust proxy", true); // Trust the proxy from ingress-nginx
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);

app.use(currentUser);

app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

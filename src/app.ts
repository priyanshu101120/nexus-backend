import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import routes from "./routes";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", routes);

// Order matters: notFound catches anything no route matched,
// errorMiddleware catches everything thrown/passed to next().
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
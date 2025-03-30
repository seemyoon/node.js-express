import express, { NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import * as mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";

import swaggerDocument from "../docs/swagger.json";
import { configs } from "./config/config";
import { ApiError } from "./errors/customApiError";
import { authRouter } from "./router/auth.router";
import { userRouter } from "./router/user.router";
// import {cronRunner} from "./cron";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/users", userRouter);
app.use("/auth", authRouter);

app.use(
  "*",
  (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ message: err.message });
    next();
  },
);

process.on("uncaughtException", (error) => {
  console.log(error);
  process.exit(1);
});

app.listen(configs.APP_PORT, async () => {
  await mongoose.connect(configs.APP_MONGO_URL);
  // cronRunner()
  console.log(
    `Server running on http://${configs.APP_HOST}:${configs.APP_PORT}`,
  );
});

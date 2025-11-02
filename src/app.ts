import cors from "cors";
import express from "express";
import helmet from "helmet";
import { RegisterRoutes } from "./generated/routes.js";
import swaggerUi from "swagger-ui-express";
import * as middlewares from "./middlewares.js";
import { httpLogger } from "./util/logger.js";

const app = express();

app.use(httpLogger);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.static("public"));

RegisterRoutes(app);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/api/workflow/swagger.json",
    },
  })
);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;

import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import Routes from "../app/routes/v1";

const { userRoute } = Routes;

const appConfig = (app) => {
  dotenv.config();
  app.use(morgan("combined"));
  app.use(cors());
  app.use(helmet());
  app.use("/api/v1/user", userRoute);
};

export default appConfig;

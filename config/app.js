import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

const appConfig = (app) => {
  dotenv.config();
  app.use(morgan("combined"));
  app.use(cors());
  app.use(helmet());
};

export default appConfig;

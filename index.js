import express from "express";
import mongoose from "mongoose";
import appConfig from "./config/app";

const app = express();
app.use(express.json());
appConfig(app);
const PORT = process.env.PORT || 3000;

try {
  mongoose.connect(process.env.MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`);
  });
} catch (err) {
  console.error(err);
}

export default app;

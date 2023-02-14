import express from "express";
import mongoose from "mongoose";
import appConfig from "./config/app.js";

const app = express();
appConfig(app);
const PORT = process.env.PORT || 3000;

try {
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`);
  });
} catch (err) {
  handleError(err);
}

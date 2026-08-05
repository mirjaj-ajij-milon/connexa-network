import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import postRoute from "./routes/posts.routes.js";
import userRoute from "./routes/user.routes.js";
const app = express();

const PORT = process.env.PORT;
const URI = process.env.MONGO_URL;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.static("uploads"));

app.use(postRoute);
app.use(userRoute);

app.get("/home", (req, res) => {
  res.send("Welcome to the new project connexa! ");
});

const start = async () => {
  try {
    const connectDB = await mongoose.connect(URI);
    console.log(`Databse connection success! `);
    app.listen(PORT, () => {
      console.log(`server was running on port ${PORT}`);
      console.log(`https://locathost:${PORT}`);
    });
  } catch (err) {
    console.log(`Error when connecting to database : ${err}`);
  }
};

start();

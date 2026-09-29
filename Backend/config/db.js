import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const URI = process.env.MONGO_URL;
    if (!URI) {
      throw new Error("MONGO_URL environment variable is missing!");
    }
    const conn = await mongoose.connect(URI);
    console.log(`Database Connected Successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to Database: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;

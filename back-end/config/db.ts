import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const uri = process.env.DB_CONNECTION_STR;
  if (!uri) {
    throw new Error("DB_CONNECTION_STR is missing");
  }
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;

import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/coop_os",
      {
        serverSelectionTimeoutMS: 2500,
      },
    );
    console.log(`[CO-OP OS DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(
      `[CO-OP OS DB Warning] MongoDB Connection Failed (${error.message}). Running in fallback mode.`,
    );
  }
};

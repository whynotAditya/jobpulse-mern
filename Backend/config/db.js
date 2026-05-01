import mongoose from "mongoose";

/**
 * Connect to MongoDB with retry logic.
 * Falls back to local MongoDB if MONGO_URI is not set.
 */
const connectDB = async () => {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobpulse";

    try {
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
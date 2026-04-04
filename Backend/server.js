import errorHandler from "./middleware/errorMiddleware.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

console.log("ENV:", process.env.MONGO_URI);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
import jobRoutes from "./routes/jobroutes.js";

app.use("/api/jobs", jobRoutes);
app.use(errorHandler);
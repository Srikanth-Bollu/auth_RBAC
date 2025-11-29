// server.js
import e from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = e();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(e.json()); // parse JSON bodies
app.use(cookieParser()); // parse cookies

// CORS: allow your frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true // allow cookies if using them
}));

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => res.send("API is running"));

// Error handler (basic)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middlewares/authMiddleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
// API Routes
app.use("/api/auth", authRoutes);

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

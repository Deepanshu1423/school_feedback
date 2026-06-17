const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const parentRoutes = require("./routes/parentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/*
  CORS Setup

  Local frontend:
  - http://localhost:5173
  - http://127.0.0.1:5173

  Production frontend:
  - https://school-feedback-eight.vercel.app

  Render Environment Variables supported:
  FRONTEND_URL=https://school-feedback-eight.vercel.app
  FRONTEND_URLS=https://school-feedback-eight.vercel.app,https://another-url.vercel.app
*/

const envFrontendUrls = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
    : []),
].filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://192.168.1.13:5173",
  "https://school-feedback-eight.vercel.app",
  ...envFrontendUrls,
].map((url) => url.replace(/\/$/, ""));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, Thunder Client, server-to-server, same-origin requests
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", cleanOrigin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("School Feedback Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const parentRoutes = require("./routes/parentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/*
  Allowed frontend URLs.

  Local development:
  - http://localhost:5173
  - http://127.0.0.1:5173

  Production:
  - Add your Vercel frontend URL in backend .env as FRONTEND_URLS
  Example:
  FRONTEND_URLS=https://your-project.vercel.app
*/
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Thunder Client, Postman, or server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const parentRoutes = require("./routes/parentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
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
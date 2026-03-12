require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const path = require("path");
const app = express();

const apiRoutes = require("../routes/main");
const authRoutes = require("../routes/auth");

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
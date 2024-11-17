const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const db = require("./Model/db");
const path = require("path");
db();

app.use(cors());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const indexRoute = require("./Routes/indexRoute");
app.use("/api", indexRoute);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/logs", (req, res) => {
  const log = [];

  res.render("logs", { log, id: "", username: "" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

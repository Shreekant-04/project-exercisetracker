const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const db = require("./Model/db");
const path = require("path");
db();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const indexRoute = require("./Routes/indexRoute");
app.use("/api", indexRoute);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

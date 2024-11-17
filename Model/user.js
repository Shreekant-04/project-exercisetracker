const mongoose = require("mongoose");

const schema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("User", schema);

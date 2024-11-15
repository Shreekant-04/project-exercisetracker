const Router = require("express").Router();
const User = require("../Model/user");
const Exercise = require("../Model/exercise");

Router.post("/users", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(500).json({ message: "username is required" });
  }
  try {
    const user = new User({ username });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});
Router.get("/users", async (req, res) => {
  try {
    const user = await User.find();
    if (!user) return res.status(404).json({ message: "No users found" });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});
Router.post("/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;

  if (!description || !duration) {
    return res
      .status(400)
      .json({ message: "description, duration, and date are required" });
  }

  if (!date) {
    date = Date.now();
  }
  try {
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    let user = await User.findOne({ _id: _id });
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    const exercise = new Exercise({
      username: user.username,
      description,
      duration,
      date: new Date(date).toDateString(),
      userId: user._id,
    });

    await exercise.save();

    const responseuser = {
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    };

    res.status(201).json(responseuser);
  } catch (err) {
    res.status(500).json({
      error: "An error occurred while adding the exercise",
      details: err.message,
    });
  }
});
Router.get("/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "No user found" });

    const exercises = await Exercise.find({ userId: user._id });

    let log = [];
    if (exercises) {
      log = exercises
        .map((exercise) => {
          return {
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date,
          };
        })
        .filter((exercise) => {
          if (from && to) {
            const date = new Date(exercise.date).getTime();
            return (
              date >= new Date(from).getTime() && date <= new Date(to).getTime()
            );
          }
          return true;
        });
    }

    if (limit) {
      log = log.slice(0, parseInt(limit, 10));
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log,
    });
  } catch (err) {
    res.status(500).json({
      error: "An error occurred while fetching logs",
      details: err.message,
    });
  }
});

module.exports = Router;

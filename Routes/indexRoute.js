const Router = require("express").Router();
const User = require("../Model/user");
const Exercise = require("../Model/exercise");

Router.post("/users", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(500).json({ message: "username is required" });
  }
  const user = await User.findOne({ username });
  if (user) {
    return res.render("response", {
      data: { error: "Username is already taken" },
    });
  }

  try {
    const user = new User({ username });
    await user.save();
    res.render("response", {
      data: {
        message: "User created successfully",
        user: { id: newUser._id, username: newUser.username },
      },
    });
  } catch (err) {
    res.render("response", {
      data: {
        error: "An error occurred while creating the user",
        details: err.message,
      },
    });
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
Router.post("/users/exercises", async (req, res) => {
  let { description, duration, date, _id } = req.body;

  if (!description || !duration || !_id) {
    return res.render("response", {
      data: {
        error: "All fields (_id, description, and duration) are required",
      },
    });
  }

  if (!date) {
    date = Date.now();
  }

  try {
    // Find user by ID
    let user = await User.findById(_id);
    if (!user) {
      return res.render("response", {
        data: { error: "No user found with the given _id" },
      });
    }

    const exercise = new Exercise({
      userId: user._id,
      username: user.username,
      description,
      duration,
      date: new Date(date).toDateString(),
    });

    await exercise.save();

    const responseuser = {
      _id: user._id,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    };

    // Render success response
    res.render("response", {
      data: { message: "Exercise added successfully", exercise: responseuser },
    });
  } catch (err) {
    res.render("response", {
      data: {
        error: "An error occurred while adding the exercise",
        details: err.message,
      },
    });
  }
});

Router.get("/users/logs", async (req, res) => {
  console.log(req.url);
  const { from, to, limit, _id } = req.query;
  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "No user found" });

    const exercises = await Exercise.find({ userId: user._id });

    let log = [];

    function getMidnight(dateInput) {
      const date = new Date(dateInput);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }
    if (exercises.length > 0) {
      log = exercises
        .map((exercise) => {
          return {
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date,
          };
        })
        .filter((exercise) => {
          if (from || to) {
            const exerciseDate = getMidnight(exercise.date);
            const fromDate = from ? getMidnight(from) : null;
            const toDate = to ? getMidnight(to) : Date.now();

            return (
              (!fromDate || exerciseDate >= fromDate) &&
              (!toDate || exerciseDate <= toDate)
            );
          }
          return true;
        });
    }

    if (limit && !isNaN(parseInt(limit, 10)) && parseInt(limit, 10) > 0) {
      log = log.slice(0, parseInt(limit, 10));
    }

    res.render("logs", {
      log,
      id: user._id,
      username: user.username,
      count: log.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching logs. Please try again later.",
    });
  }
});

module.exports = Router;

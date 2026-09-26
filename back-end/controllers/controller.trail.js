const Trail = require("../models/TrailModel");

const createTrail = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const trail = await Trail.create({
      ...req.body,
      geo: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    });
    res.status(201).json(trail);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A trail with that name already exists.",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

const getAllTrails = async (req, res) => {
  try {
    const trails = await Trail.find().sort({ name: 1 });
    res.status(200).json(trails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrail = async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id);
    if (!trail) {
      return res.status(404).json({ message: "The trail cannot be found." });
    }
    res.status(200).json(trail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTrail = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.latitude != null && update.longitude != null) {
      update.geo = {
        type: "Point",
        coordinates: [Number(update.longitude), Number(update.latitude)],
      };
    }
    const trail = await Trail.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!trail) {
      return res.status(404).json({ message: "The trail cannot be found." });
    }
    res.status(200).json(trail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTrail = async (req, res) => {
  try {
    const trail = await Trail.findByIdAndDelete(req.params.id);
    if (!trail) {
      return res.status(404).json({ message: "The trail cannot be found." });
    }
    res.status(200).json({ message: "Trail successfully deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTrail,
  getAllTrails,
  getTrail,
  updateTrail,
  deleteTrail,
};

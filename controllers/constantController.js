const Constant = require("../models/constantsModel");

const getConstants = async (req, res) => {
  try {
    const constants = await Constant.find({});
    res.status(200).json(constants);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getConstantByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const constant = await Constant.find({ key: key });
    res.status(200).json(constant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateConstantValue = async (req, res) => {
  try {
    const { key, value } = req.body;
    const constant = await Constant.findOneAndUpdate(
      { key: key },
      { value: value }
    );
    res.status(200).json(constant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getConstants,
  getConstantByKey,
  updateConstantValue,
};

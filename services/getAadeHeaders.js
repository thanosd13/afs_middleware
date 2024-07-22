const model = require("../models/index");

const getHeaders = async (id) => {
  try {
    const userData = await model.user.findAll({
      where: { id: id },
    });

    if (!userData.length) {
      return "Aade headers not found!";
    }
    return userData[0].dataValues;
  } catch (error) {
    return error;
  }
};

module.exports = { getHeaders };

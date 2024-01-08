"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  Page.init(
    {
      title: {
        type: DataTypes.STRING,
        unique: true, // Set to true to make it unique
      },
      content:{
        type: DataTypes.BLOB, // BLOB is used for storing binary data like Uint8Array
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Pages",
    }
  );

  return Page;
};

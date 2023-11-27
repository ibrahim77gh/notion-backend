const { get, create, save, getOne } = require("./page.action.js");

module.exports = {
  "/": {
    get: {
      action: get,
      level: "public",
    },
    post: {
      action: create,
      level: "public",
    },
  },
  "/:title": {
    get: {
      action: getOne,
      level: "public",
    },
  },
  "/save": {
    post: {
      action: save,
      level: "public",
    },
  },
};

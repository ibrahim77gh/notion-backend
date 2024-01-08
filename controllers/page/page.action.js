const db = require("../../models/index");
const PageModel = db.Pages;

module.exports.get = async (request, response) => {
  try {
    const req = await PageModel.findAll();
    response.status(200).json(req);
  } catch (error) {
    console.log(error);
    response.status(500).json("Some Error Occured");
  }
};

module.exports.getOne = async (request, response) => {
  try {
    const req = await PageModel.findOne({
      where: { title: request?.params?.title },
    });
    response.status(200).json(req);
  } catch (error) {
    console.log(error);
    response.status(500).json("Some Error Occured");
  }
};

module.exports.create = async (request, response) => {
  try {
    const page = await PageModel.findOne({
      where: {
        title: request?.body?.title,
      },
    });
    if (page) {
      response.status(409).json("Page Title Already Exist");
      return;
    }
    const req = await PageModel.create({
      title: request?.body?.title,
      content: null,
    });
    response.status(200).json(req);
  } catch (error) {
    response.status(500).json("Some Error Occured");
  }
};

module.exports.save = async (request, response) => {
  try {
    console.log(request.body?.content, request?.body?.title);
    const content = await PageModel.update(
      { content: request?.body?.content },
      { where: { title: request?.body?.title } }
    );
    response.status(200).json("Saved");
  } catch (error) {
    response.status(500).json("Some Error Occured");
  }
};

module.exports.deletePage = async (request, response) => {
  try {
    const titleToDelete = request?.params?.title;

    // Check if the page with the specified title exists
    const page = await PageModel.findOne({
      where: { title: titleToDelete },
    });

    if (!page) {
      response.status(404).json("Page not found");
      return;
    }

    // Delete the page
    await PageModel.destroy({
      where: { title: titleToDelete },
    });

    response.status(200).json("Page deleted successfully");
  } catch (error) {
    console.log(error);
    response.status(500).json("Some Error Occured");
  }
};


const { default: mongoose } = require("mongoose");
const deleteFile = require("../utils/deleteFile");
const Article = require("../models/Article");
const ErrorResponse = require("../utils/errorResponse");
const Images = require("../models/Images");

exports.getAll = async (req, res, next) => {
  try {
    const articles = await Article.find();

    res.status(200).json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse("This Article is not exsist"));
    }

    const article = await Article.findById(id);

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  const article = {
    image: req.file?.filename,
    ...req.body,
    tags: JSON.parse(req.body.tags),
    en: JSON.parse(req.body.en),
    uk: JSON.parse(req.body.uk),
  };

  try {
    const newArticle = await Article.create({ ...article });

    res.status(201).json({ success: true, data: newArticle });
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  const { id } = req.params;
  const article = {
    image: req?.file ? req?.file?.filename : req?.body?.file,
    ...req?.body,
    tags: JSON.parse(req?.body?.tags),
    en: JSON.parse(req?.body?.en),
    uk: JSON.parse(req?.body?.uk),
  };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse("This Article is not exsist"));
    }

    const oldArticle = await Article.findById(id).select("image");

    if (oldArticle.image && req.file) {
      deleteFile(oldArticle.image);
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { ...article },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedArticle });
  } catch (err) {
    next(err);
  }
};

exports.editView = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new ErrorResponse(404, "This Article is not exsist");
    }

    const currentArticle = await Article.findById(id);

    let updatedArticle;

    if (req.body.viewed) {
      updatedArticle = await Article.findByIdAndUpdate(
        id,
        {
          views: +currentArticle.views + 1,
        },
        { new: true }
      );
    }

    res.status(200).json({ success: true, data: updatedArticle });
  } catch (err) {
    next(err);
  }
};

exports.deleteOne = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse("This Article is not exsist"));
    }
    const article = await Article.findById(id).select("image");

    if (article.image) {
      deleteFile(article.image);
    }

    const images = await Images.find({ parentId: id }).select("file");
    images.forEach((elem) => deleteFile(elem.file));
    await Images.deleteMany({ parentId: id });

    await Article.findByIdAndRemove(id);

    res
      .status(200)
      .json({ success: true, message: "Article deleted successfully" });
  } catch (err) {
    next(err);
  }
};

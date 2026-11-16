const mongoose = require("mongoose");
const { Schema } = mongoose;

const savedArticleSchema = new Schema(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

savedArticleSchema.index({ article: 1, user: 1 }, { unique: true });
savedArticleSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("SavedArticle", savedArticleSchema);

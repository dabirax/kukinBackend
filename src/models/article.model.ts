const mongoose = require("mongoose");
const { Schema } = mongoose;

const ARTICLE_CATEGORIES = [
  "Health News",
  "Nutrition",
  "Recipes",
  "Food Safety",
  "Myths & Facts",
];

const sourceSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const articleSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 140,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 400,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: ARTICLE_CATEGORIES,
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorAvatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    sources: {
      type: [sourceSchema],
      default: [],
    },
    readTime: {
      type: Number,
      default: 1,
      min: 1,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

articleSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
  tags: "text",
});

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });

const Article = mongoose.model("Article", articleSchema);

module.exports = { Article, ARTICLE_CATEGORIES };

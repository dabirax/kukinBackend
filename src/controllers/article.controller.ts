const fs = require("fs");
const mongoose = require("mongoose");
const { Article, ARTICLE_CATEGORIES } = require("../models/article.model");
const ArticleLike = require("../models/article-like.model");
const SavedArticle = require("../models/saved-article.model");
const {
  ArticleReport,
  REPORT_REASONS,
} = require("../models/article-report.model");
const uploader = require("../config/cloudinary").uploader;

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

function toObjectId(value: any) {
  const id = String(value || "");
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
}

function parsePagination(query: any) {
  const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);
  const requestedLimit =
    Number.parseInt(query?.limit, 10) || DEFAULT_PAGE_SIZE;
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedLimit));
  return { page, limit };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || `article-${Date.now()}`;
  let slug = base;
  let suffix = 2;

  while (await Article.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function estimateReadTime(content: string) {
  const words = String(content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function normalizeTags(value: any) {
  const raw = Array.isArray(value)
    ? value
    : String(value || "").split(",");

  const tags = Array.from(
    new Set(
      raw
        .map((tag: any) => String(tag || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );

  return tags.slice(0, 8);
}

function validateSources(value: any, errors: Record<string, string>) {
  if (value === undefined) return undefined;

  if (!Array.isArray(value)) {
    errors.sources = "Sources must be a list";
    return [];
  }

  if (value.length > 5) {
    errors.sources = "Add no more than 5 sources";
    return [];
  }

  const sources: { label: string; url: string }[] = [];

  for (const source of value) {
    const label = String(source?.label || "").trim();
    const url = String(source?.url || "").trim();

    if (!label || !url) continue;

    try {
      const parsed = new URL(url);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      errors.sources = "Each source needs a valid http(s) URL";
      continue;
    }

    sources.push({ label: label.slice(0, 120), url });
  }

  return sources;
}

function validateArticleBody(body: any, partial = false) {
  const errors: Record<string, string> = {};
  const data: any = {};
  const has = (key: string) =>
    Object.prototype.hasOwnProperty.call(body || {}, key);

  if (!partial || has("title")) {
    const title = String(body?.title || "").trim();

    if (title.length < 5 || title.length > 140) {
      errors.title = "Title must be between 5 and 140 characters";
    } else {
      data.title = title;
    }
  }

  if (!partial || has("excerpt")) {
    const excerpt = String(body?.excerpt || "").trim();

    if (excerpt.length < 20 || excerpt.length > 400) {
      errors.excerpt = "Excerpt must be between 20 and 400 characters";
    } else {
      data.excerpt = excerpt;
    }
  }

  if (!partial || has("content")) {
    const content = String(body?.content || "").trim();

    if (content.length < 40) {
      errors.content = "Article content must be at least 40 characters";
    } else {
      data.content = content;
    }
  }

  if (!partial || has("category")) {
    const category = String(body?.category || "").trim();

    if (!ARTICLE_CATEGORIES.includes(category)) {
      errors.category = "Choose a valid article category";
    } else {
      data.category = category;
    }
  }

  if (has("coverImage")) {
    data.coverImage = String(body?.coverImage || "").trim();
  }

  if (has("status")) {
    const status = String(body?.status || "").trim();

    if (!["draft", "published"].includes(status)) {
      errors.status = "Status must be draft or published";
    } else {
      data.status = status;
    }
  }

  if (has("tags")) {
    data.tags = normalizeTags(body?.tags);
  }

  if (has("sources")) {
    const sources = validateSources(body?.sources, errors);

    if (sources !== undefined) {
      data.sources = sources;
    }
  }

  if (has("featured")) {
    data.featured = Boolean(body?.featured);
  }

  return { data, errors };
}

function serializeArticle(
  article: any,
  options: {
    includeContent?: boolean;
    userId?: string | undefined;
    liked?: boolean;
    saved?: boolean;
  } = {}
) {
  const authorId = article.author?._id
    ? String(article.author._id)
    : String(article.author || "");

  const payload: any = {
    id: String(article._id),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage || "",
    category: article.category,
    tags: Array.isArray(article.tags) ? article.tags : [],
    author: {
      id: authorId,
      name:
        article.authorName ||
        article.author?.name ||
        "Kukin contributor",
      avatarUrl:
        article.authorAvatar ||
        article.author?.avatarUrl ||
        "",
    },
    status: article.status,
    featured: Boolean(article.featured),
    sources: Array.isArray(article.sources) ? article.sources : [],
    readTime: Number(article.readTime) || 1,
    likeCount: Number(article.likeCount) || 0,
    bookmarkCount: Number(article.bookmarkCount) || 0,
    viewCount: Number(article.viewCount) || 0,
    publishedAt: article.publishedAt || article.createdAt || null,
    createdAt: article.createdAt || null,
    updatedAt: article.updatedAt || null,
    likedByMe: Boolean(options.liked),
    savedByMe: Boolean(options.saved),
    isOwner: Boolean(
      options.userId && authorId && options.userId === authorId
    ),
  };

  if (options.includeContent) {
    payload.content = article.content;
  }

  return payload;
}

async function interactionSets(userId: string | undefined, ids: any[]) {
  if (!userId || ids.length === 0) {
    return { likedIds: new Set<string>(), savedIds: new Set<string>() };
  }

  const [likes, saves] = await Promise.all([
    ArticleLike.find({ user: userId, article: { $in: ids } })
      .select("article")
      .lean(),
    SavedArticle.find({ user: userId, article: { $in: ids } })
      .select("article")
      .lean(),
  ]);

  return {
    likedIds: new Set(
      likes.map((item: any) => String(item.article))
    ),
    savedIds: new Set(
      saves.map((item: any) => String(item.article))
    ),
  };
}

function sortFor(value: string | undefined) {
  if (value === "oldest") {
    return { publishedAt: 1, createdAt: 1 } as any;
  }

  if (value === "popular") {
    return { likeCount: -1, viewCount: -1, publishedAt: -1 } as any;
  }

  return { publishedAt: -1, createdAt: -1 } as any;
}

function buildFilter(query: any, includeUnpublished = false) {
  const filter: any = includeUnpublished ? {} : { status: "published" };

  if (includeUnpublished && ["draft", "published"].includes(query?.status)) {
    filter.status = query.status;
  }

  const q = String(query?.q || "").trim();

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { title: regex },
      { excerpt: regex },
      { tags: regex },
      { authorName: regex },
    ];
  }

  const category = String(query?.category || "").trim();

  if (category && ARTICLE_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  const tag = String(query?.tag || "").trim().toLowerCase();

  if (tag) {
    filter.tags = tag;
  }

  if (String(query?.featured || "") === "true") {
    filter.featured = true;
  }

  const excludeId = toObjectId(query?.excludeId);

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return filter;
}

async function listArticles(req: any, filter: any) {
  const { page, limit } = parsePagination(req.query);
  const skip = (page - 1) * limit;

  const [total, articles] = await Promise.all([
    Article.countDocuments(filter),
    Article.find(filter)
      .sort(sortFor(req.query?.sort))
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const ids = articles.map((article: any) => article._id);
  const { likedIds, savedIds } = await interactionSets(
    req.user ? String(req.user._id) : undefined,
    ids
  );

  const items = articles.map((article: any) =>
    serializeArticle(article, {
      userId: req.user ? String(req.user._id) : undefined,
      liked: likedIds.has(String(article._id)),
      saved: savedIds.has(String(article._id)),
    })
  );

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

async function getArticles(req: any, res: any) {
  try {
    const filter = buildFilter(req.query);
    const data = await listArticles(req, filter);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load articles",
      code: "ARTICLES_FETCH_FAILED",
    });
  }
}

async function getFeaturedArticle(req: any, res: any) {
  try {
    const article = await Article.findOne({
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    if (!article) {
      return res.json({ article: null });
    }

    const { likedIds, savedIds } = await interactionSets(
      req.user ? String(req.user._id) : undefined,
      [article._id]
    );

    return res.json({
      article: serializeArticle(article, {
        userId: req.user ? String(req.user._id) : undefined,
        liked: likedIds.has(String(article._id)),
        saved: savedIds.has(String(article._id)),
      }),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load the featured article",
      code: "FEATURED_ARTICLE_FETCH_FAILED",
    });
  }
}

async function getMyArticles(req: any, res: any) {
  try {
    const filter = buildFilter(req.query, true);
    filter.author = req.user._id;
    const data = await listArticles(req, filter);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load your articles",
      code: "MY_ARTICLES_FETCH_FAILED",
    });
  }
}

async function getSavedArticles(req: any, res: any) {
  try {
    const { page, limit } = parsePagination(req.query);
    const skip = (page - 1) * limit;

    const [total, saved] = await Promise.all([
      SavedArticle.countDocuments({ user: req.user._id }),
      SavedArticle.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const ids = saved.map((item: any) => item.article);
    const articles = await Article.find({
      _id: { $in: ids },
      status: "published",
    }).lean();

    const articleMap = new Map(
      articles.map((article: any) => [String(article._id), article])
    );
    const { likedIds } = await interactionSets(
      String(req.user._id),
      ids
    );

    const items = ids
      .map((id: any) => articleMap.get(String(id)))
      .filter(Boolean)
      .map((article: any) =>
        serializeArticle(article, {
          userId: String(req.user._id),
          liked: likedIds.has(String(article._id)),
          saved: true,
        })
      );

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return res.json({
      items,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load saved articles",
      code: "SAVED_ARTICLES_FETCH_FAILED",
    });
  }
}

async function getArticleBySlug(req: any, res: any) {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).lean();

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    const ownerId = String(article.author);
    const isOwner = req.user && String(req.user._id) === ownerId;
    const isAdmin = req.user?.role === "admin";

    if (article.status !== "published" && !isOwner && !isAdmin) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    const { likedIds, savedIds } = await interactionSets(
      req.user ? String(req.user._id) : undefined,
      [article._id]
    );

    return res.json({
      article: serializeArticle(article, {
        includeContent: true,
        userId: req.user ? String(req.user._id) : undefined,
        liked: likedIds.has(String(article._id)),
        saved: savedIds.has(String(article._id)),
      }),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load this article",
      code: "ARTICLE_FETCH_FAILED",
    });
  }
}

async function recordArticleView(req: any, res: any) {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, status: "published" },
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .select("viewCount")
      .lean();

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    return res.json({ viewCount: Number(article.viewCount) || 0 });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to record this view",
      code: "ARTICLE_VIEW_FAILED",
    });
  }
}

async function createArticle(req: any, res: any) {
  try {
    const { data, errors } = validateArticleBody(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Please fix the highlighted fields",
        code: "VALIDATION_ERROR",
        errors,
      });
    }

    const status = data.status || "published";
    const article = await Article.create({
      ...data,
      slug: await uniqueSlug(data.title),
      status,
      featured:
        req.user.role === "admin" ? Boolean(data.featured) : false,
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatarUrl || "",
      readTime: estimateReadTime(data.content),
      publishedAt: status === "published" ? new Date() : null,
    });

    return res.status(201).json({
      article: serializeArticle(article.toObject(), {
        includeContent: true,
        userId: String(req.user._id),
      }),
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "An article with that title already exists",
        code: "SLUG_IN_USE",
      });
    }

    return res.status(500).json({
      message: error?.message || "Unable to create this article",
      code: "ARTICLE_CREATE_FAILED",
    });
  }
}

async function updateArticle(req: any, res: any) {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    const isOwner = String(article.author) === String(req.user._id);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can only edit your own articles",
        code: "ARTICLE_FORBIDDEN",
      });
    }

    const { data, errors } = validateArticleBody(req.body, true);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Please fix the highlighted fields",
        code: "VALIDATION_ERROR",
        errors,
      });
    }

    if (data.title) article.title = data.title;
    if (data.excerpt) article.excerpt = data.excerpt;
    if (data.content) {
      article.content = data.content;
      article.readTime = estimateReadTime(data.content);
    }
    if (data.category) article.category = data.category;
    if (data.coverImage !== undefined) article.coverImage = data.coverImage;
    if (data.tags !== undefined) article.tags = data.tags;
    if (data.sources !== undefined) article.sources = data.sources;
    if (data.featured !== undefined && req.user.role === "admin") {
      article.featured = data.featured;
    }

    if (data.status) {
      article.status = data.status;

      if (data.status === "published" && !article.publishedAt) {
        article.publishedAt = new Date();
      }

      if (data.status === "draft") {
        article.publishedAt = null;
      }
    }

    await article.save();

    return res.json({
      article: serializeArticle(article.toObject(), {
        includeContent: true,
        userId: String(req.user._id),
        liked: false,
        saved: false,
      }),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to update this article",
      code: "ARTICLE_UPDATE_FAILED",
    });
  }
}

async function publishArticle(req: any, res: any) {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    const isOwner = String(article.author) === String(req.user._id);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can only publish your own articles",
        code: "ARTICLE_FORBIDDEN",
      });
    }

    article.status = "published";
    article.publishedAt = article.publishedAt || new Date();
    await article.save();

    return res.json({
      article: serializeArticle(article.toObject(), {
        includeContent: true,
        userId: String(req.user._id),
      }),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to publish this article",
      code: "ARTICLE_PUBLISH_FAILED",
    });
  }
}

async function deleteArticle(req: any, res: any) {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    const isOwner = String(article.author) === String(req.user._id);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can only delete your own articles",
        code: "ARTICLE_FORBIDDEN",
      });
    }

    await Promise.all([
      Article.deleteOne({ _id: article._id }),
      ArticleLike.deleteMany({ article: article._id }),
      SavedArticle.deleteMany({ article: article._id }),
      ArticleReport.deleteMany({ article: article._id }),
    ]);

    return res.json({ message: "Article deleted" });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to delete this article",
      code: "ARTICLE_DELETE_FAILED",
    });
  }
}

async function currentCounts(articleId: any) {
  const article = await Article.findById(articleId)
    .select("likeCount bookmarkCount")
    .lean();

  return {
    likeCount: Number(article?.likeCount) || 0,
    bookmarkCount: Number(article?.bookmarkCount) || 0,
  };
}

async function likeArticle(req: any, res: any) {
  try {
    const article = await Article.findById(req.params.id).select(
      "_id status"
    );

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    if (article.status !== "published") {
      return res.status(400).json({
        message: "Only published articles can be liked",
        code: "ARTICLE_NOT_PUBLISHED",
      });
    }

    try {
      await ArticleLike.create({
        article: article._id,
        user: req.user._id,
      });

      const updated = await Article.findByIdAndUpdate(
        article._id,
        { $inc: { likeCount: 1 } },
        { new: true }
      )
        .select("likeCount")
        .lean();

      return res.json({
        liked: true,
        likeCount: Number(updated?.likeCount) || 0,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        const counts = await currentCounts(article._id);
        return res.json({ liked: true, likeCount: counts.likeCount });
      }

      throw error;
    }
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to like this article",
      code: "ARTICLE_LIKE_FAILED",
    });
  }
}

async function unlikeArticle(req: any, res: any) {
  try {
    const article = await Article.findById(req.params.id).select("_id");

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    const result = await ArticleLike.deleteOne({
      article: article._id,
      user: req.user._id,
    });

    if (result.deletedCount > 0) {
      await Article.updateOne(
        { _id: article._id, likeCount: { $gt: 0 } },
        { $inc: { likeCount: -1 } }
      );
    }

    const counts = await currentCounts(article._id);
    return res.json({ liked: false, likeCount: counts.likeCount });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to remove your like",
      code: "ARTICLE_UNLIKE_FAILED",
    });
  }
}

async function saveArticle(req: any, res: any) {
  try {
    const article = await Article.findById(req.params.id).select(
      "_id status"
    );

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    if (article.status !== "published") {
      return res.status(400).json({
        message: "Only published articles can be saved",
        code: "ARTICLE_NOT_PUBLISHED",
      });
    }

    try {
      await SavedArticle.create({
        article: article._id,
        user: req.user._id,
      });

      const updated = await Article.findByIdAndUpdate(
        article._id,
        { $inc: { bookmarkCount: 1 } },
        { new: true }
      )
        .select("bookmarkCount")
        .lean();

      return res.json({
        saved: true,
        bookmarkCount: Number(updated?.bookmarkCount) || 0,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        const counts = await currentCounts(article._id);
        return res.json({
          saved: true,
          bookmarkCount: counts.bookmarkCount,
        });
      }

      throw error;
    }
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to save this article",
      code: "ARTICLE_SAVE_FAILED",
    });
  }
}

async function unsaveArticle(req: any, res: any) {
  try {
    const article = await Article.findById(req.params.id).select("_id");

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    const result = await SavedArticle.deleteOne({
      article: article._id,
      user: req.user._id,
    });

    if (result.deletedCount > 0) {
      await Article.updateOne(
        { _id: article._id, bookmarkCount: { $gt: 0 } },
        { $inc: { bookmarkCount: -1 } }
      );
    }

    const counts = await currentCounts(article._id);
    return res.json({
      saved: false,
      bookmarkCount: counts.bookmarkCount,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to remove this bookmark",
      code: "ARTICLE_UNSAVE_FAILED",
    });
  }
}

async function reportArticle(req: any, res: any) {
  try {
    const article = await Article.findById(req.params.id).select(
      "_id author status"
    );

    if (!article || article.status !== "published") {
      return res.status(404).json({
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      });
    }

    if (String(article.author) === String(req.user._id)) {
      return res.status(400).json({
        message: "You cannot report your own article",
        code: "ARTICLE_REPORT_SELF",
      });
    }

    const reason = String(req.body?.reason || "").trim();
    const details = String(req.body?.details || "").trim();

    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        message: "Choose a valid report reason",
        code: "VALIDATION_ERROR",
      });
    }

    if (details.length > 600) {
      return res.status(400).json({
        message: "Report details must be 600 characters or fewer",
        code: "VALIDATION_ERROR",
      });
    }

    try {
      await ArticleReport.create({
        article: article._id,
        user: req.user._id,
        reason,
        details,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        return res.status(409).json({
          message: "You have already reported this article",
          code: "ARTICLE_ALREADY_REPORTED",
        });
      }

      throw error;
    }

    await Article.updateOne(
      { _id: article._id },
      { $inc: { reportCount: 1 } }
    );

    return res.status(201).json({
      message: "Thanks. Our team will review this article.",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to report this article",
      code: "ARTICLE_REPORT_FAILED",
    });
  }
}

async function uploadArticleCover(req: any, res: any) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Choose an image to upload",
        code: "VALIDATION_ERROR",
      });
    }

    const result = await uploader.upload(req.file.path, {
      folder: "kukin/articles",
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: error?.message || "Unable to upload that image",
      code: "ARTICLE_COVER_UPLOAD_FAILED",
    });
  }
}

module.exports = {
  getArticles,
  getFeaturedArticle,
  getMyArticles,
  getSavedArticles,
  getArticleBySlug,
  recordArticleView,
  createArticle,
  updateArticle,
  publishArticle,
  deleteArticle,
  likeArticle,
  unlikeArticle,
  saveArticle,
  unsaveArticle,
  reportArticle,
  uploadArticleCover,
};

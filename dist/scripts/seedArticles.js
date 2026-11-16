"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const connectDB = require("../db/connectDB");
const User = require("../models/user.model");
const { Article } = require("../models/article.model");
const ArticleLike = require("../models/article-like.model");
const SavedArticle = require("../models/saved-article.model");
const { ArticleReport } = require("../models/article-report.model");
const cloudinary = require("../config/cloudinary");
const { SEED_ARTICLES, SEED_DRAFTS, ASSET_FILES, DEMO_USERS, } = require("../data/seedArticles");
const ASSETS_DIR = path.resolve(__dirname, "../../assets");
const CLOUDINARY_FOLDER = "kukin/articles/seed";
const BCRYPT_ROUNDS = 10;
function slugify(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 90);
}
function estimateReadTime(content) {
    const words = String(content || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}
function withTransform(url) {
    return String(url || "").replace("/upload/", "/upload/f_auto,q_auto,w_1200,h_800,c_fill/");
}
async function upsertUser(input) {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const existing = await User.findOne({ email: input.email });
    if (existing) {
        existing.name = input.name;
        existing.role = input.role;
        existing.isVerified = true;
        existing.provider = "local";
        existing.passwordHash = passwordHash;
        await existing.save();
        return existing;
    }
    return User.create({
        name: input.name,
        email: input.email,
        role: input.role,
        isVerified: true,
        provider: "local",
        passwordHash,
    });
}
async function uploadAsset(filename) {
    const filePath = path.join(ASSETS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing seed image asset: ${filePath}`);
    }
    const publicId = `${CLOUDINARY_FOLDER}/${slugify(path.basename(filename, path.extname(filename)))}`;
    try {
        const existing = await cloudinary.api.resource(publicId, {
            resource_type: "image",
        });
        return withTransform(existing.secure_url);
    }
    catch (error) {
        if (error?.http_code && error.http_code !== 404) {
            throw error;
        }
    }
    const result = await cloudinary.uploader.upload(filePath, {
        folder: CLOUDINARY_FOLDER,
        public_id: path.basename(filename, path.extname(filename)),
        overwrite: false,
        resource_type: "image",
    });
    return withTransform(result.secure_url);
}
async function buildImageMap() {
    const map = new Map();
    console.log(`Uploading ${ASSET_FILES.length} cover images to Cloudinary...`);
    for (const filename of ASSET_FILES) {
        const url = await uploadAsset(filename);
        map.set(filename, url);
        console.log(`  ✓ ${filename}`);
    }
    return map;
}
function publishedDate(index) {
    const hoursAgo = (index + 1) * 26;
    return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
}
async function uniqueSlug(title, used) {
    const base = slugify(title) || `article-${Date.now()}`;
    let slug = base;
    let suffix = 2;
    while (used.has(slug) || (await Article.exists({ slug }))) {
        slug = `${base}-${suffix}`;
        suffix += 1;
    }
    used.add(slug);
    return slug;
}
async function createArticles(author, imageMap) {
    const usedSlugs = new Set();
    const created = [];
    for (let index = 0; index < SEED_ARTICLES.length; index += 1) {
        const item = SEED_ARTICLES[index];
        const slug = await uniqueSlug(item.title, usedSlugs);
        const publishedAt = publishedDate(index);
        const article = await Article.create({
            slug,
            title: item.title,
            excerpt: item.excerpt,
            content: item.content,
            coverImage: imageMap.get(item.image) || "",
            category: item.category,
            tags: item.tags,
            author: author._id,
            authorName: author.name,
            authorAvatar: author.avatarUrl || "",
            status: "published",
            featured: Boolean(item.featured),
            sources: item.sources,
            readTime: estimateReadTime(item.content),
            likeCount: 0,
            bookmarkCount: 0,
            reportCount: 0,
            viewCount: 35 + ((index * 37) % 480),
            publishedAt,
        });
        created.push(article);
    }
    for (const item of SEED_DRAFTS) {
        const slug = await uniqueSlug(item.title, usedSlugs);
        const article = await Article.create({
            slug,
            title: item.title,
            excerpt: item.excerpt,
            content: item.content,
            coverImage: imageMap.get(item.image) || "",
            category: item.category,
            tags: item.tags,
            author: author._id,
            authorName: author.name,
            authorAvatar: author.avatarUrl || "",
            status: "draft",
            featured: false,
            sources: item.sources,
            readTime: estimateReadTime(item.content),
            likeCount: 0,
            bookmarkCount: 0,
            reportCount: 0,
            viewCount: 0,
            publishedAt: null,
        });
        created.push(article);
    }
    return created;
}
async function seedInteractions(articles, reader, tester) {
    const likeCounts = new Map();
    const bookmarkCounts = new Map();
    const reportCounts = new Map();
    const like = async (article, user) => {
        try {
            await ArticleLike.create({ article: article._id, user: user._id });
            const key = String(article._id);
            likeCounts.set(key, (likeCounts.get(key) || 0) + 1);
        }
        catch (error) {
            if (error?.code !== 11000)
                throw error;
        }
    };
    const save = async (article, user) => {
        try {
            await SavedArticle.create({ article: article._id, user: user._id });
            const key = String(article._id);
            bookmarkCounts.set(key, (bookmarkCounts.get(key) || 0) + 1);
        }
        catch (error) {
            if (error?.code !== 11000)
                throw error;
        }
    };
    const report = async (article, user, reason, details) => {
        try {
            await ArticleReport.create({
                article: article._id,
                user: user._id,
                reason,
                details,
            });
            const key = String(article._id);
            reportCounts.set(key, (reportCounts.get(key) || 0) + 1);
        }
        catch (error) {
            if (error?.code !== 11000)
                throw error;
        }
    };
    const publishedArticles = articles.filter((article) => article.status === "published");
    for (let index = 0; index < publishedArticles.length; index += 1) {
        const article = publishedArticles[index];
        if (index % 3 === 0)
            await like(article, reader);
        if (index % 4 === 0)
            await like(article, tester);
        if (index % 5 === 0)
            await save(article, reader);
        if (index % 7 === 0)
            await save(article, tester);
    }
    const reportTargets = publishedArticles;
    if (reportTargets[7]) {
        await report(reportTargets[7], tester, "Misleading information", "The headline makes a stronger claim than the body supports.");
    }
    if (reportTargets[19]) {
        await report(reportTargets[19], tester, "Harmful health advice", "Please review the storage guidance in this article.");
    }
    for (const article of articles) {
        const key = String(article._id);
        await Article.updateOne({ _id: article._id }, {
            $set: {
                likeCount: likeCounts.get(key) || 0,
                bookmarkCount: bookmarkCounts.get(key) || 0,
                reportCount: reportCounts.get(key) || 0,
            },
        });
    }
}
async function clearPreviousSeed(authorId) {
    const previous = await Article.find({ author: authorId })
        .select("_id")
        .lean();
    const ids = previous.map((article) => article._id);
    if (ids.length === 0)
        return 0;
    await Promise.all([
        Article.deleteMany({ _id: { $in: ids } }),
        ArticleLike.deleteMany({ article: { $in: ids } }),
        SavedArticle.deleteMany({ article: { $in: ids } }),
        ArticleReport.deleteMany({ article: { $in: ids } }),
    ]);
    return ids.length;
}
async function main() {
    await connectDB();
    const [author, reader, tester] = await Promise.all(DEMO_USERS.map(upsertUser));
    const removed = await clearPreviousSeed(author._id);
    if (removed > 0) {
        console.log(`Removed ${removed} previously seeded articles.`);
    }
    const imageMap = await buildImageMap();
    const articles = await createArticles(author, imageMap);
    await seedInteractions(articles, reader, tester);
    const published = articles.filter((article) => article.status === "published").length;
    const drafts = articles.length - published;
    console.log("");
    console.log("Seed complete.");
    console.log(`  Published articles: ${published}`);
    console.log(`  Draft articles: ${drafts}`);
    console.log(`  Cover images: ${imageMap.size}`);
    console.log("");
    console.log("Demo accounts (verified):");
    for (const user of DEMO_USERS) {
        console.log(`  ${user.email} / ${user.password} (${user.role})`);
    }
    await mongoose.connection.close();
}
main()
    .then(() => process.exit(0))
    .catch(async (error) => {
    console.error("Seed failed:", error?.message || error);
    try {
        await mongoose.connection.close();
    }
    catch {
        // ignore close errors
    }
    process.exit(1);
});
//# sourceMappingURL=seedArticles.js.map
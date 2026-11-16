"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const { Schema } = mongoose;
const REPORT_REASONS = [
    "Misleading information",
    "Harmful health advice",
    "Inappropriate content",
    "Spam or advertising",
    "Copyright issue",
    "Other",
];
const articleReportSchema = new Schema({
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
    reason: {
        type: String,
        enum: REPORT_REASONS,
        required: true,
    },
    details: {
        type: String,
        default: "",
        trim: true,
        maxlength: 600,
    },
    status: {
        type: String,
        enum: ["open", "reviewed", "dismissed"],
        default: "open",
        index: true,
    },
}, { timestamps: true });
articleReportSchema.index({ article: 1, user: 1 }, { unique: true });
const ArticleReport = mongoose.model("ArticleReport", articleReportSchema);
module.exports = { ArticleReport, REPORT_REASONS };
//# sourceMappingURL=article-report.model.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./middleware/auth");
const detect_1 = require("./routes/detect");
const error_1 = require("./middleware/error");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    methods: ['POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400, // 24 hours
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);
// Body parser middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Authentication middleware
app.use(auth_1.authenticateRequest);
// Routes
app.use('/api/detect', detect_1.detectRouter);
// Error handling
app.use(error_1.errorHandler);
// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Detection service running on port ${PORT}`);
});

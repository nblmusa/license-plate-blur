"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRequest = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const authenticateRequest = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'No authorization header' });
        return;
    }
    // Check if it's an API key or JWT token
    if (authHeader.startsWith('ApiKey ')) {
        const apiKey = authHeader.split(' ')[1];
        authenticateApiKey(apiKey, req, res, next);
        return;
    }
    else if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        authenticateJWT(token, req, res, next);
        return;
    }
    res.status(401).json({ error: 'Invalid authorization header' });
};
exports.authenticateRequest = authenticateRequest;
function authenticateApiKey(apiKey, req, res, next) {
    if (!apiKey.startsWith('lpm_')) {
        res.status(401).json({ error: 'Invalid API key format' });
        return;
    }
    // In a production environment, you would validate this against your database
    // and check if the API key is active and within its rate limits
    // For now, we'll do a simple hash comparison
    const hash = crypto_1.default
        .createHmac('sha256', process.env.API_KEY_SALT || '')
        .update(apiKey)
        .digest('hex');
    // Here you would compare the hash with the stored hash in your database
    // For demo purposes, we'll just set a user object
    req.user = {
        id: hash.substring(0, 8),
        plan: 'api'
    };
    next();
}
function authenticateJWT(token, req, res, next) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

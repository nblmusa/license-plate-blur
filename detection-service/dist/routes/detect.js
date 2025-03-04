"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const detection_1 = require("../services/detection");
const error_1 = require("../middleware/error");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new error_1.ApiError(400, 'Only image files are allowed'));
            return;
        }
        cb(null, true);
    }
});
exports.detectRouter = (0, express_1.Router)();
exports.detectRouter.post('/', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new error_1.ApiError(400, 'No image file provided');
        }
        const maskType = req.body.maskType === 'solid' ? 'solid' : 'blur';
        const options = {
            blurRadius: parseInt(req.body.blurRadius) || 30,
            blurOpacity: parseFloat(req.body.blurOpacity) || 1,
            maskType: maskType
        };
        const result = await detection_1.detectionService.detectAndMask(req.file.buffer, options);
        res.json({
            success: true,
            data: {
                detectedPlates: result.detectedPlates,
                processedImage: result.processedImage.toString('base64'),
                thumbnail: result.thumbnail.toString('base64')
            }
        });
    }
    catch (error) {
        next(error);
    }
});

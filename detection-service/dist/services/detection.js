"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectionService = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const sharp_1 = __importDefault(require("sharp"));
const error_1 = require("../middleware/error");
class DetectionService {
    constructor() {
        this.model = null;
        this.isLoading = false;
        this.loadingPromise = null;
    }
    async loadModel() {
        if (this.model)
            return;
        if (this.isLoading) {
            await this.loadingPromise;
            return;
        }
        this.isLoading = true;
        this.loadingPromise = (async () => {
            try {
                this.model = await tf.loadGraphModel(`file://${process.env.MODEL_PATH}/model.json`);
            }
            catch (error) {
                console.error('Failed to load model:', error);
                throw new error_1.ApiError(500, 'Failed to load detection model');
            }
            finally {
                this.isLoading = false;
            }
        })();
        await this.loadingPromise;
    }
    async detectAndMask(imageBuffer, options = {}) {
        await this.loadModel();
        if (!this.model) {
            throw new error_1.ApiError(500, 'Model not loaded');
        }
        const { blurRadius = 30, blurOpacity = 1, maskType = 'blur' } = options;
        try {
            // Prepare image for model
            const image = await (0, sharp_1.default)(imageBuffer)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
            // Convert to tensor
            const tensor = tf.tensor4d(new Float32Array(image.data), [1, image.info.height, image.info.width, 4]);
            // Run detection
            const predictions = await this.model.predict(tensor);
            const detections = await this.processDetections(predictions, 0.5);
            // Apply masking
            const maskedImage = await this.applyMasking(imageBuffer, detections, { blurRadius, blurOpacity, maskType });
            // Create thumbnail
            const thumbnail = await (0, sharp_1.default)(maskedImage)
                .resize(200, 200, { fit: 'inside' })
                .toBuffer();
            return {
                processedImage: maskedImage,
                thumbnail,
                detectedPlates: detections.length
            };
        }
        catch (error) {
            console.error('Detection error:', error);
            throw new error_1.ApiError(500, 'Failed to process image');
        }
    }
    async processDetections(predictions, confidenceThreshold) {
        const detections = [];
        const [boxes, scores] = await Promise.all([
            predictions.slice([0, 0, 0], [1, -1, 4]).data(),
            predictions.slice([0, 0, 4], [1, -1, 1]).data()
        ]);
        for (let i = 0; i < scores.length; i++) {
            if (scores[i] > confidenceThreshold) {
                detections.push({
                    x1: boxes[i * 4],
                    y1: boxes[i * 4 + 1],
                    x2: boxes[i * 4 + 2],
                    y2: boxes[i * 4 + 3],
                    confidence: scores[i]
                });
            }
        }
        return detections;
    }
    async applyMasking(imageBuffer, detections, options) {
        const { width, height } = await (0, sharp_1.default)(imageBuffer).metadata();
        if (!width || !height) {
            throw new error_1.ApiError(400, 'Invalid image dimensions');
        }
        let processedImage = (0, sharp_1.default)(imageBuffer);
        for (const detection of detections) {
            const x = Math.floor(detection.x1 * width);
            const y = Math.floor(detection.y1 * height);
            const w = Math.floor((detection.x2 - detection.x1) * width);
            const h = Math.floor((detection.y2 - detection.y1) * height);
            if (options.maskType === 'blur') {
                // Extract and blur the region
                const blurredRegion = await (0, sharp_1.default)(imageBuffer)
                    .extract({ left: x, top: y, width: w, height: h })
                    .blur(options.blurRadius)
                    .toBuffer();
                // Composite the blurred region back
                processedImage = processedImage.composite([{
                        input: blurredRegion,
                        left: x,
                        top: y,
                        blend: 'over'
                    }]);
            }
            else {
                // Create a solid black rectangle
                const mask = await (0, sharp_1.default)({
                    create: {
                        width: w,
                        height: h,
                        channels: 4,
                        background: { r: 0, g: 0, b: 0, alpha: 1 }
                    }
                }).toBuffer();
                processedImage = processedImage.composite([{
                        input: mask,
                        left: x,
                        top: y,
                        blend: 'over'
                    }]);
            }
        }
        return processedImage.toBuffer();
    }
}
exports.detectionService = new DetectionService();

import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import { ApiError } from '../middleware/error';

interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
}

interface ProcessingResult {
  processedImage: Buffer;
  thumbnail: Buffer;
  detectedPlates: number;
}

class DetectionService {
  private model: tf.GraphModel | null = null;
  private isLoading = false;
  private loadingPromise: Promise<void> | null = null;

  async loadModel() {
    if (this.model) return;
    if (this.isLoading) {
      await this.loadingPromise;
      return;
    }

    this.isLoading = true;
    this.loadingPromise = (async () => {
      try {
        this.model = await tf.loadGraphModel(
          `file://${process.env.MODEL_PATH}/model.json`
        );
      } catch (error) {
        console.error('Failed to load model:', error);
        throw new ApiError(500, 'Failed to load detection model');
      } finally {
        this.isLoading = false;
      }
    })();

    await this.loadingPromise;
  }

  async detectAndMask(
    imageBuffer: Buffer,
    options: {
      blurRadius?: number;
      blurOpacity?: number;
      maskType?: 'blur' | 'solid';
    } = {}
  ): Promise<ProcessingResult> {
    await this.loadModel();
    if (!this.model) {
      throw new ApiError(500, 'Model not loaded');
    }

    const {
      blurRadius = 30,
      blurOpacity = 1,
      maskType = 'blur'
    } = options;

    try {
      // Prepare image for model
      const image = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Convert to tensor
      const tensor = tf.tensor4d(
        new Float32Array(image.data),
        [1, image.info.height, image.info.width, 4]
      );

      // Run detection
      const predictions = await this.model.predict(tensor) as tf.Tensor;
      const detections = await this.processDetections(predictions, 0.5);

      // Apply masking
      const maskedImage = await this.applyMasking(
        imageBuffer,
        detections,
        { blurRadius, blurOpacity, maskType }
      );

      // Create thumbnail
      const thumbnail = await sharp(maskedImage)
        .resize(200, 200, { fit: 'inside' })
        .toBuffer();

      return {
        processedImage: maskedImage,
        thumbnail,
        detectedPlates: detections.length
      };
    } catch (error) {
      console.error('Detection error:', error);
      throw new ApiError(500, 'Failed to process image');
    }
  }

  private async processDetections(
    predictions: tf.Tensor,
    confidenceThreshold: number
  ): Promise<Detection[]> {
    const detections: Detection[] = [];
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

  private async applyMasking(
    imageBuffer: Buffer,
    detections: Detection[],
    options: {
      blurRadius: number;
      blurOpacity: number;
      maskType: 'blur' | 'solid';
    }
  ): Promise<Buffer> {
    const { width, height } = await sharp(imageBuffer).metadata();
    if (!width || !height) {
      throw new ApiError(400, 'Invalid image dimensions');
    }

    let processedImage = sharp(imageBuffer);

    for (const detection of detections) {
      const x = Math.floor(detection.x1 * width);
      const y = Math.floor(detection.y1 * height);
      const w = Math.floor((detection.x2 - detection.x1) * width);
      const h = Math.floor((detection.y2 - detection.y1) * height);

      if (options.maskType === 'blur') {
        // Extract and blur the region
        const blurredRegion = await sharp(imageBuffer)
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
      } else {
        // Create a solid black rectangle
        const mask = await sharp({
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

export const detectionService = new DetectionService(); 
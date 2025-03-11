import * as tf from '@tensorflow/tfjs-node';
import sharp, { Blend } from 'sharp';
import { LogoSettings, DEFAULT_SETTINGS } from './config';
import { detectFaces } from './face-detection';

export interface ProcessingResult {
  processedImage: Buffer;
  thumbnail: Buffer;
  detectedPlates: number;
  detectedFaces: number;
  error?: Error;
}

export interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
}

export const MASK_TYPES = ['blur', 'solid'] as const;
export const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const;

async function loadModel() {
  return await tf.loadGraphModel('file://./models/license_plate_model/model.json');
}

export async function detectAndMaskLicensePlates(
  imageBuffer: Buffer,
  logoBuffer?: Buffer,
  logoSettings: LogoSettings = DEFAULT_SETTINGS,
  isAuthenticated: boolean = false
): Promise<ProcessingResult> {
  try {
    tf.engine().startScope();

    // Initialize result
    let detectedPlates = 0;
    let detectedFaces = 0;
    let processedImage = imageBuffer;

    // Detect and mask faces first
    const faces = await detectFaces(imageBuffer); console.log({faces})
    detectedFaces = faces.length;

    if (detectedFaces > 0) {
      // Create a mask for each face
      const faceMasks = await Promise.all(faces.map(async face => {
        const box = face.box;
        // Add padding around the face for better privacy
        const padding = {
          x: box.width * 0.1,
          y: box.height * 0.1
        };

        // Ensure coordinates are within image bounds
        const left = Math.max(0, Math.round(box.xMin - padding.x));
        const top = Math.max(0, Math.round(box.yMin - padding.y));
        const width = Math.min(
          Math.round(box.width + padding.x * 2),
          originalWidth - left
        );
        const height = Math.min(
          Math.round(box.height + padding.y * 2),
          originalHeight - top
        );

        // Create blurred mask
        const mask = await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0.7 }
          }
        })
        .blur(20)
        .toBuffer();

        return {
          input: mask,
          blend: 'over' as Blend,
          left,
          top
        };
      }));

      // Apply face blurring
      processedImage = await sharp(processedImage)
        .composite(faceMasks)
        .toBuffer();
    }

    // Load and preprocess the image
    const image = await sharp(imageBuffer);
    const metadata = await image.metadata();
    const { 
      width: originalWidth = 640, 
      height: originalHeight = 640, 
      format 
    } = metadata;

    // If logo is provided, preprocess it
    let processedLogo: Buffer | undefined;
    if (logoBuffer) {
      try {
        processedLogo = await sharp(logoBuffer)
          .trim()
          .toBuffer();
      } catch (error) {
        console.error('Error preprocessing logo:', error);
        processedLogo = undefined;
      }
    }

    // Calculate aspect ratio and padding
    const aspectRatio = originalWidth / originalHeight;
    let resizeWidth = 640;
    let resizeHeight = 640;
    let paddingX = 0;
    let paddingY = 0;

    if (aspectRatio > 1) {
      resizeHeight = Math.round(640 / aspectRatio);
      paddingY = Math.round((640 - resizeHeight) / 2);
    } else {
      resizeWidth = Math.round(640 * aspectRatio);
      paddingX = Math.round((640 - resizeWidth) / 2);
    }

    // Resize image for model input
    const resizedImage = await image
      .resize(640, 640, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .raw()
      .toBuffer();

    // Calculate scaling ratios
    const xRatio = originalWidth / resizeWidth;
    const yRatio = originalHeight / resizeHeight;

    // Convert to tensor and normalize
    const tensor = tf.tensor3d(new Uint8Array(resizedImage), [640, 640, 3]);
    const normalized = tf.tidy(() => tensor.div(255.0).expandDims(0));
    tf.dispose(tensor);

    // Load model and get predictions
    const model = await loadModel();
    const predictions = await model.predict(normalized) as tf.Tensor2D;
    tf.dispose(normalized);

    const transRes = predictions.transpose([0, 2, 1]);
    tf.dispose(predictions);

    // Process predictions to get bounding boxes
    const boxes = tf.tidy(() => {
      const w = transRes.slice([0, 0, 2], [-1, -1, 1]);
      const h = transRes.slice([0, 0, 3], [-1, -1, 1]);
      const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2));
      const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2));
      return tf.concat([y1, x1, tf.add(y1, h), tf.add(x1, w)], 2).squeeze() as tf.Tensor2D;
    });

    // Get confidence scores
    const [scores, classes] = tf.tidy(() => {
      const rawScores = transRes.slice([0, 0, 4], [-1, -1, 1])
        .squeeze()
        .reshape([-1]) as tf.Tensor1D;
      
      const processedScores = rawScores.sigmoid();
      
      const scoreThreshold = 0.1;
      const filteredScores = tf.where(
        tf.abs(tf.sub(processedScores, 0.5)).greater(scoreThreshold),
        processedScores,
        tf.zeros(processedScores.shape)
      ) as tf.Tensor1D;
      
      const classes = tf.zeros([rawScores.shape[0]], 'int32');
      
      return [filteredScores, classes];
    });

    tf.dispose(transRes);

    // Apply non-max suppression
    const nms = await tf.image.nonMaxSuppressionAsync(
      boxes,
      scores,
      500,  // maxOutputSize
      0.3,  // iouThreshold
      0.1   // scoreThreshold
    );

    const boxes_data = boxes.gather(nms, 0).dataSync();
    const scores_data = scores.gather(nms, 0).dataSync();

    tf.dispose([boxes, scores, classes, nms]);

    // Convert TypedArrays to regular arrays
    const boxesArray = Array.from(boxes_data);
    const scoresArray = Array.from(scores_data);

    // Create composite operations for masking
    const compositeOperations = await Promise.all(
      scoresArray.map(async (score, i) => {
        if (score <= 0.1) return []; // Skip low confidence detections

        let [y1, x1, y2, x2] = boxesArray.slice(i * 4, (i + 1) * 4);
        
        // Remove padding offset and scale coordinates back to original image size
        x1 = Math.round((x1 - paddingX) * xRatio);
        x2 = Math.round((x2 - paddingX) * xRatio);
        y1 = Math.round((y1 - paddingY) * yRatio);
        y2 = Math.round((y2 - paddingY) * yRatio);

        // Ensure coordinates are within image bounds
        x1 = Math.max(0, Math.min(x1, originalWidth));
        x2 = Math.max(0, Math.min(x2, originalWidth));
        y1 = Math.max(0, Math.min(y1, originalHeight));
        y2 = Math.max(0, Math.min(y2, originalHeight));

        const boxWidth = x2 - x1;
        const boxHeight = y2 - y1;

        if (processedLogo) {
          try {
            const logoWidth = Math.round(boxWidth * (logoSettings.size || 100) / 100);
            const logoHeight = Math.round(boxHeight * (logoSettings.size || 100) / 100);

            const resizedLogo = await sharp(processedLogo)
              .resize(logoWidth, logoHeight, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .png()
              .toBuffer();

            // Calculate position based on logoSettings
            let left = x1;
            let top = y1;
            
            switch (logoSettings.position) {
              case 'top-right':
                left = x2 - logoWidth;
                break;
              case 'bottom-left':
                top = y2 - logoHeight;
                break;
              case 'bottom-right':
                left = x2 - logoWidth;
                top = y2 - logoHeight;
                break;
              case 'center':
              default:
                left = x1 + Math.round((boxWidth - logoWidth) / 2);
                top = y1 + Math.round((boxHeight - logoHeight) / 2);
                break;
            }

            // Create a white background with the logo
            const logoWithBackground = await sharp({
              create: {
                width: logoWidth,
                height: logoHeight,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
              }
            })
            .composite([{
              input: resizedLogo,
              blend: 'over' as Blend
            }])
            .png()
            .toBuffer();

            return [{
              input: logoWithBackground,
              top: Math.round(top),
              left: Math.round(left)
            }];
          } catch (error) {
            console.error('Error applying logo:', error);
            return await createBlurredRegion(x1, y1, boxWidth, boxHeight, imageBuffer, logoSettings);
          }
        }

        return await createBlurredRegion(x1, y1, boxWidth, boxHeight, imageBuffer, logoSettings);
      })
    );

    // Filter out empty operations
    const validOperations = compositeOperations.flat().filter(op => op);

    // Create final image with masks
    processedImage = await sharp(processedImage)
      .composite(validOperations)
      .jpeg()
      .toBuffer();

    // Create thumbnail
    const thumbnail = await sharp(imageBuffer)
      .resize(320, 240, { fit: 'contain' })
      .jpeg()
      .toBuffer();

    return {
      processedImage,
      thumbnail,
      detectedPlates: scoresArray.filter(score => score > 0.1).length,
      detectedFaces,
      error: undefined
    };

  } catch (error) {
    console.error('Image processing error:', error);
    return {
      processedImage: imageBuffer,
      thumbnail: imageBuffer,
      detectedPlates: 0,
      detectedFaces: 0,
      error: error as Error
    };
  } finally {
    tf.engine().endScope();
  }
}

async function createBlurredRegion(
  x1: number, 
  y1: number, 
  width: number, 
  height: number,
  imageBuffer: Buffer,
  settings: LogoSettings
) {
  if (width <= 0 || height <= 0) return [];

  try {
    const maskType = settings.maskType || 'blur';
    const opacity = settings.blur?.opacity ?? 1;

    if (maskType === 'solid') {
      const solidMask = await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: Math.round(opacity * 255) }
        }
      })
      .png()
      .toBuffer();

      return [{
        input: solidMask,
        blend: 'over' as Blend,
        top: Math.round(y1),
        left: Math.round(x1)
      }];
    }

    // Default blur mask
    const blurRadius = settings.blur?.radius ?? 30;
    const extractedRegion = await sharp(imageBuffer)
      .extract({
        left: x1,
        top: y1,
        width: width,
        height: height
      })
      .blur(blurRadius)
      .ensureAlpha(opacity)
      .png()
      .toBuffer();

    return [{
      input: extractedRegion,
      blend: 'over' as Blend,
      top: Math.round(y1),
      left: Math.round(x1)
    }];
  } catch (error) {
    console.error('Error creating masked region:', error);
    return [];
  }
}

async function applyLogo(
  imageBuffer: Buffer,
  logoBuffer: Buffer,
  settings: any
): Promise<Buffer> {
  const { width, height } = await sharp(imageBuffer).metadata();
  const logoSize = Math.min(width!, height!) / 4;

  const resizedLogo = await sharp(logoBuffer)
    .resize(Math.round(logoSize), Math.round(logoSize), {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  return await sharp(imageBuffer)
    .composite([{
      input: resizedLogo,
      gravity: 'southeast',
      blend: 'over'
    }])
    .toBuffer();
} 
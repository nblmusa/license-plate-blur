import * as tf from '@tensorflow/tfjs-node';
import sharp, { Blend } from 'sharp';
import { LogoSettings, DEFAULT_SETTINGS } from './config';
import { detectFaces } from './face-detection';
import { detectPlates } from './plate-detection';

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

export async function detectAndMask(
  imageBuffer: Buffer,
  logoBuffer?: Buffer,
  logoSettings: LogoSettings = DEFAULT_SETTINGS,
  isAuthenticated: boolean = false
): Promise<ProcessingResult> {
  try {
    tf.engine().startScope();

    // Initialize result
    let processedImage = imageBuffer;

    // Load and preprocess the image
    const image = await sharp(imageBuffer);
    const metadata = await image.metadata();
    const originalWidth = metadata.width || 640;
    const originalHeight = metadata.height || 640;

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

    // Detect license plates
    let plateDetections: Detection[] = [];
    try {
      plateDetections = await detectPlates(normalized as tf.Tensor4D, paddingX, paddingY, xRatio, yRatio);
    } catch (error) {
      console.error('License plate detection error:', error);
    }

    // Detect faces if authenticated
    let faceDetections: Detection[] = [];
    try {
      faceDetections = await detectFaces(normalized as tf.Tensor4D, paddingX, paddingY, xRatio, yRatio);
    } catch (error) {
      console.error('Face detection error:', error);
    }

    tf.dispose(normalized);

    // Create composite operations for masking plates
    const plateOperations = await Promise.all(
      plateDetections.map(async (detection) => {
        const boxWidth = detection.x2 - detection.x1;
        const boxHeight = detection.y2 - detection.y1;

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
            let left = detection.x1;
            let top = detection.y1;
            
            switch (logoSettings.position) {
              case 'top-right':
                left = detection.x2 - logoWidth;
                break;
              case 'bottom-left':
                top = detection.y2 - logoHeight;
                break;
              case 'bottom-right':
                left = detection.x2 - logoWidth;
                top = detection.y2 - logoHeight;
                break;
              case 'center':
              default:
                left = detection.x1 + Math.round((boxWidth - logoWidth) / 2);
                top = detection.y1 + Math.round((boxHeight - logoHeight) / 2);
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
            return await createBlurredRegion(detection.x1, detection.y1, boxWidth, boxHeight, imageBuffer, logoSettings);
          }
        }

        return await createBlurredRegion(detection.x1, detection.y1, boxWidth, boxHeight, imageBuffer, logoSettings);
      })
    );

    // Create face blur operations
    const faceOperations = await Promise.all(
      faceDetections.map(async (detection) => {
        const boxWidth = detection.x2 - detection.x1;
        const boxHeight = detection.y2 - detection.y1;
        return await createBlurredRegion(
          detection.x1,
          detection.y1,
          boxWidth,
          boxHeight,
          imageBuffer,
          { ...logoSettings, maskType: 'blur', blur: { radius: 30, opacity: 1 } },
          true // Enable rounded mask for faces
        );
      })
    );

    // Filter out empty operations and combine plate and face operations
    const validOperations = [...plateOperations.flat(), ...faceOperations.flat()].filter(op => op);

    // Create final image with masks
    processedImage = await sharp(processedImage)
      .composite(validOperations)
      .png()
      .toBuffer();

    // Create thumbnail
    const thumbnail = await sharp(imageBuffer)
      .resize(320, 240, { fit: 'contain' })
      .png()
      .toBuffer();

    return {
      processedImage,
      thumbnail,
      detectedPlates: plateDetections.length,
      detectedFaces: faceDetections.length,
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
  settings: LogoSettings,
  isRounded: boolean = false
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
      .composite(isRounded ? [{
        input: await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 255 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg><ellipse cx="${width/2}" cy="${height/2}" rx="${width/2}" ry="${height/2}" /></svg>`),
          blend: 'dest-in' as Blend
        }])
        .toBuffer(),
        blend: 'dest-in' as Blend
      }] : [])
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
      .composite(isRounded ? [{
        input: Buffer.from(`<svg><ellipse cx="${width/2}" cy="${height/2}" rx="${width/2}" ry="${height/2}" /></svg>`),
        blend: 'dest-in' as Blend
      }] : [])
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
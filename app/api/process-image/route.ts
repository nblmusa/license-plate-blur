import { NextResponse } from 'next/server'
import * as tf from '@tensorflow/tfjs-node'
import sharp, { Blend } from 'sharp'
import path from 'path'
import { promises as fs } from 'fs'

export const dynamic = 'force-dynamic'

// Initialize TensorFlow.js
async function initTF() {
  // Set backend to CPU since we're in a Node.js environment
  await tf.setBackend('cpu')
  await tf.ready()
}

async function loadModel() {
  const modelPath = path.join(process.cwd(), 'models', 'license_plate_model', 'model.json')
  
  try {
    // Verify model file exists
    await fs.access(modelPath)
    return await tf.loadGraphModel(`file://${modelPath}`)
  } catch (error) {
    console.error('Error loading model:', error)
    throw new Error('Model not found or inaccessible')
  }
}

async function detectAndMaskLicensePlates(imageBuffer: Buffer, logoBuffer?: Buffer, logoSettings?: any) {
  try {
    tf.engine().startScope()

    // Load and preprocess the image
    const image = await sharp(imageBuffer)
    const metadata = await image.metadata()
    const { 
      width: originalWidth = 640, 
      height: originalHeight = 640, 
      format 
    } = metadata

    // If logo is provided, preprocess it
    let processedLogo: Buffer | undefined
    if (logoBuffer) {
      try {
        processedLogo = await sharp(logoBuffer)
          .trim() // Remove any excess transparent space
          .toBuffer()
      } catch (error) {
        console.error('Error preprocessing logo:', error)
        processedLogo = undefined
      }
    }

    // Calculate aspect ratio to handle padding offset
    const aspectRatio = originalWidth / originalHeight
    let resizeWidth = 640
    let resizeHeight = 640
    let paddingX = 0
    let paddingY = 0

    if (aspectRatio > 1) {
      // Image is wider than tall
      resizeHeight = Math.round(640 / aspectRatio)
      paddingY = Math.round((640 - resizeHeight) / 2)
    } else {
      // Image is taller than wide
      resizeWidth = Math.round(640 * aspectRatio)
      paddingX = Math.round((640 - resizeWidth) / 2)
    }

    // First resize to 640x640 while maintaining aspect ratio
    const resizedImage = await image
      .resize(640, 640, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .raw()
      .toBuffer()

    // Calculate scaling ratios accounting for padding
    const xRatio = originalWidth / resizeWidth
    const yRatio = originalHeight / resizeHeight

    // Convert to tensor and normalize
    const tensor = tf.tensor3d(new Uint8Array(resizedImage), [640, 640, 3])
    const normalized = tf.tidy(() => tensor.div(255.0).expandDims(0))
    tf.dispose(tensor)

    // Load model and get predictions
    const model = await loadModel()
    const predictions = await model.predict(normalized) as tf.Tensor2D
    tf.dispose(normalized)

    const transRes = predictions.transpose([0, 2, 1])
    tf.dispose(predictions)

    // Process predictions to get bounding boxes
    const boxes = tf.tidy(() => {
      const w = transRes.slice([0, 0, 2], [-1, -1, 1])
      const h = transRes.slice([0, 0, 3], [-1, -1, 1])
      const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2))
      const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2))
      return tf.concat([y1, x1, tf.add(y1, h), tf.add(x1, w)], 2).squeeze() as tf.Tensor2D
    })

    // Get confidence scores
    const [scores, classes] = tf.tidy(() => {
      const rawScores = transRes.slice([0, 0, 4], [-1, -1, 1])
        .squeeze()
        .reshape([-1]) as tf.Tensor1D
      
      const processedScores = rawScores.sigmoid()
      
      const scoreThreshold = 0.1
      const filteredScores = tf.where(
        tf.abs(tf.sub(processedScores, 0.5)).greater(scoreThreshold),
        processedScores,
        tf.zeros(processedScores.shape)
      ) as tf.Tensor1D
      
      const classes = tf.zeros([rawScores.shape[0]], 'int32')
      
      return [filteredScores, classes]
    })

    tf.dispose(transRes)

    // Apply non-max suppression
    const nms = await tf.image.nonMaxSuppressionAsync(
      boxes,
      scores,
      500,  // maxOutputSize
      0.3,  // iouThreshold
      0.1   // scoreThreshold
    )

    const boxes_data = boxes.gather(nms, 0).dataSync()
    const scores_data = scores.gather(nms, 0).dataSync()

    tf.dispose([boxes, scores, classes, nms])

    // Convert TypedArrays to regular arrays for iteration
    const boxesArray = Array.from(boxes_data)
    const scoresArray = Array.from(scores_data)

    // Create composite operations for masking
    const compositeOperations = await Promise.all(
      scoresArray.map(async (score, i) => {
        if (score <= 0.1) return [] // Skip low confidence detections

        let [y1, x1, y2, x2] = boxesArray.slice(i * 4, (i + 1) * 4)
        
        // Remove padding offset and scale coordinates back to original image size
        x1 = Math.round((x1 - paddingX) * xRatio)
        x2 = Math.round((x2 - paddingX) * xRatio)
        y1 = Math.round((y1 - paddingY) * yRatio)
        y2 = Math.round((y2 - paddingY) * yRatio)

        // Ensure coordinates are within image bounds
        x1 = Math.max(0, Math.min(x1, originalWidth))
        x2 = Math.max(0, Math.min(x2, originalWidth))
        y1 = Math.max(0, Math.min(y1, originalHeight))
        y2 = Math.max(0, Math.min(y2, originalHeight))

        const boxWidth = x2 - x1
        const boxHeight = y2 - y1

        if (processedLogo) {
          try {
            // Get logo dimensions before resizing
            const logoMetadata = await sharp(processedLogo).metadata()
            const logoWidth = Math.round(boxWidth * (logoSettings?.size || 100) / 100)
            const logoHeight = Math.round(boxHeight * (logoSettings?.size || 100) / 100)
            
            console.log('Processing license plate:', {
              plateSize: { width: boxWidth, height: boxHeight },
              logoSize: { width: logoWidth, height: logoHeight },
              position: logoSettings?.position || 'center',
              opacity: logoSettings?.opacity || 100
            })

            // Resize logo to fit the license plate area while maintaining aspect ratio
            const resizedLogo = await sharp(processedLogo)
              .resize(logoWidth, logoHeight, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .png()
              .toBuffer()

            // Calculate position based on logoSettings
            let left = x1
            let top = y1
            
            switch (logoSettings?.position) {
              case 'top-left':
                break
              case 'top-right':
                left = x2 - logoWidth
                break
              case 'bottom-left':
                top = y2 - logoHeight
                break
              case 'bottom-right':
                left = x2 - logoWidth
                top = y2 - logoHeight
                break
              case 'center':
              default:
                left = x1 + Math.round((boxWidth - logoWidth) / 2)
                top = y1 + Math.round((boxHeight - logoHeight) / 2)
                break
            }

            // Create a white background with the logo composited on top
            const logoWithBackground = await sharp({
              create: {
                width: logoWidth,
                height: logoHeight,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
              }
            })
            .png()
            .composite([{
              input: resizedLogo,
              blend: 'over' as Blend
            }])
            .png()
            .toBuffer()

            // Return the composite operation
            return [{
              input: logoWithBackground,
              top: Math.round(top),
              left: Math.round(left)
            }]
          } catch (error) {
            console.error('Error applying logo to license plate:', error)
            return await fallbackToBlur()
          }
        }

        // Fallback to blur function
        async function fallbackToBlur() {
          const extractedRegion = await sharp(imageBuffer)
            .extract({
              left: x1,
              top: y1,
              width: boxWidth,
              height: boxHeight
            })
            .blur(20)
            .toBuffer()

          return [{
            input: extractedRegion,
            top: y1,
            left: x1
          }]
        }

        // If no logo, use blur
        return await fallbackToBlur()
      })
    )

    // Apply masked regions to the original image
    const maskedImage = await sharp(imageBuffer)
      .composite(compositeOperations.flat())
      .toFormat(format || 'jpeg')
      .toBuffer()

    console.log('Image processing complete:', {
      detectedPlates: scores_data.length,
      maskType: processedLogo ? 'logo' : 'blur'
    })

    tf.engine().endScope()
    return {
      image: maskedImage,
      detections: scores_data.length
    }
  } catch (error) {
    tf.engine().endScope()
    console.error('Error in detectAndMaskLicensePlates:', error)
    throw error
  }
}

function processDetections(predictions: number[][], threshold: number) {
  const boxes = []
  for (let i = 0; i < predictions.length; i++) {
    const confidence = predictions[i][4]
    if (confidence > threshold) {
      boxes.push({
        x: predictions[i][0],
        y: predictions[i][1],
        width: predictions[i][2],
        height: predictions[i][3],
        confidence
      })
    }
  }
  return boxes
}

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()
    const { image, logo, filename, contentType, logoSettings } = body

    if (!image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      )
    }

    console.log('Processing request:', {
      hasImage: !!image,
      hasLogo: !!logo,
      settings: logoSettings
    })

    // Validate the image data
    if (!image.match(/^[A-Za-z0-9+/=]+$/)) {
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 }
      )
    }

    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(image, 'base64')
      let logoBuffer: Buffer | undefined
      
      if (logo && typeof logo === 'string' && logo.match(/^[A-Za-z0-9+/=]+$/)) {
        logoBuffer = Buffer.from(logo, 'base64')
      }

      // Process the image using the TensorFlow model
      const { image: processedBuffer, detections } = await detectAndMaskLicensePlates(buffer, logoBuffer, logoSettings)
      
      // Convert processed image back to base64
      const processedImageBase64 = `data:${contentType};base64,${processedBuffer.toString('base64')}`

      // Return the processed image
      return NextResponse.json({
        success: true,
        maskedImage: processedImageBase64,
        metadata: {
          filename,
          contentType,
          processedAt: new Date().toISOString(),
          licensePlatesDetected: detections,
          originalSize: buffer.length,
          processedSize: processedBuffer.length,
          maskType: logoBuffer ? 'logo' : 'blur'
        }
      })

    } catch (error) {
      console.error('Error processing image:', error)
      return NextResponse.json(
        { error: 'Failed to process image data' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
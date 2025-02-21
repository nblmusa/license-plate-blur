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

async function detectAndMaskLicensePlates(imageBuffer: Buffer, logoBuffer?: Buffer) {
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
        console.error('Error processing logo:', error)
        // If logo processing fails, fall back to blur
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
          // Resize logo to fit the license plate area while maintaining aspect ratio
          const resizedLogo = await sharp(processedLogo)
            .resize(boxWidth, boxHeight, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer()

          return [{
            input: resizedLogo,
            top: y1,
            left: x1,
            blend: 'over' as Blend
          }]
        } else {
          // Fall back to blur if no logo or logo processing failed
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
      })
    )

    // Apply masked regions to the original image
    const maskedImage = await sharp(imageBuffer)
      .composite(compositeOperations.flat())
      .toFormat(format || 'jpeg')
      .toBuffer()

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
    console.log('Processing image request...')
    
    // Get the request body
    const body = await request.json()
    const { image, logo, filename, contentType } = body

    if (!image) {
      console.log('Error: No image data provided')
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      )
    }

    console.log('Received image data:', {
      filename,
      contentType,
      imageSize: image.length,
      hasLogo: !!logo
    })

    // Validate the image data
    if (!image.match(/^[A-Za-z0-9+/=]+$/)) {
      console.log('Error: Invalid image data format')
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

      console.log('Converted to buffer, size:', buffer.length)

      // Process the image using the TensorFlow model
      const { image: processedBuffer, detections } = await detectAndMaskLicensePlates(buffer, logoBuffer)
      
      // Convert processed image back to base64
      const processedImageBase64 = `data:${contentType};base64,${processedBuffer.toString('base64')}`

      console.log('Processing complete, detected plates:', detections)

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
      console.error('Error processing image buffer:', error)
      return NextResponse.json(
        { error: 'Failed to process image data' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in process-image API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
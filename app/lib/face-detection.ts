import * as faceDetection from '@tensorflow-models/blazeface'
import * as tf from '@tensorflow/tfjs-node'
import sharp from 'sharp'

// Initialize TensorFlow backend
tf.setBackend('tensorflow')

let detector: faceDetection.BlazeFaceModel | null = null
let isBackendInitialized = false

interface FaceBox {
  box: {
    xMin: number;
    yMin: number;
    width: number;
    height: number;
  };
}

async function ensureBackendInitialized() {
  if (!isBackendInitialized) {
    await tf.ready()
    console.log('TensorFlow backend initialized:', tf.getBackend())
    isBackendInitialized = true
  }
}

export async function initFaceDetector() {
  try {
    if (!detector) {
      await ensureBackendInitialized()
      detector = await faceDetection.load({
        maxFaces: 10,
        scoreThreshold: 0.1  // Lower threshold for better detection
      })
      console.log('Face detector model loaded')
    }
    return detector
  } catch (error) {
    console.error('Error initializing face detector:', error)
    throw error
  }
}

export async function detectFaces(imageBuffer: Buffer): Promise<FaceBox[]> {
  try {
    // Ensure backend and model are initialized
    await ensureBackendInitialized()
    const faceDetector = await initFaceDetector()
    
    // Get original image dimensions
    const metadata = await sharp(imageBuffer).metadata()
    console.log('Original image metadata:', metadata)
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image dimensions')
    }

    const originalWidth = metadata.width
    const originalHeight = metadata.height

    // Resize to 416x416 which is better for detection
    const preprocessedImage = await sharp(imageBuffer)
      .resize(416, 416, { 
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255 }
      })
      .gamma(1.2) // Adjust gamma for better contrast
      .modulate({
        brightness: 1.1,  // Slightly increase brightness
        saturation: 1.2   // Increase saturation
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    console.log('Preprocessed image info:', preprocessedImage.info)

    // Validate preprocessed image
    if (preprocessedImage.data.length !== preprocessedImage.info.width * preprocessedImage.info.height * 3) {
      throw new Error('Invalid preprocessed image data')
    }

    // Create tensor with correct shape and type
    const tensor = tf.tidy(() => {
      // Create tensor from raw data
      const pixels = new Float32Array(preprocessedImage.data.length)
      
      // Normalize pixels to [-1, 1] range instead of [0, 1]
      for (let i = 0; i < preprocessedImage.data.length; i++) {
        pixels[i] = (preprocessedImage.data[i] / 127.5) - 1
      }

      const imageTensor = tf.tensor3d(
        pixels,
        [preprocessedImage.info.height, preprocessedImage.info.width, 3]
      )

      // Log a sample of pixel values for debugging
      const sampleValues = imageTensor.slice([0, 0, 0], [1, 1, 3]).dataSync()
      console.log('Sample pixel values:', Array.from(sampleValues))

      return imageTensor
    })

    // Log tensor info for debugging
    console.log('Tensor shape:', tensor.shape, 'dtype:', tensor.dtype)
    
    // Try detection with both tensor modes
    let predictions = await faceDetector.estimateFaces(tensor, true)
    if (predictions.length === 0) {
      console.log('Retrying detection with returnTensors: false')
      predictions = await faceDetector.estimateFaces(tensor, false)
    }
    
    console.log('Raw predictions:', JSON.stringify(predictions, null, 2))
    
    // Calculate scaling factors
    const scaleX = originalWidth / 416
    const scaleY = originalHeight / 416

    // Convert BlazeFace predictions to match MediaPipe format
    const faces = predictions.map(pred => {
      // Handle both tensor and array types
      const topLeft = pred.topLeft instanceof tf.Tensor ? 
        pred.topLeft.arraySync() as [number, number] : 
        pred.topLeft as [number, number]
      
      const bottomRight = pred.bottomRight instanceof tf.Tensor ? 
        pred.bottomRight.arraySync() as [number, number] : 
        pred.bottomRight as [number, number]
      
      // Scale coordinates back to original image size
      const xMin = Math.max(0, Math.round(topLeft[0] * scaleX))
      const yMin = Math.max(0, Math.round(topLeft[1] * scaleY))
      const width = Math.min(
        Math.round((bottomRight[0] - topLeft[0]) * scaleX),
        originalWidth - xMin
      )
      const height = Math.min(
        Math.round((bottomRight[1] - topLeft[1]) * scaleY),
        originalHeight - yMin
      )

      return {
        box: {
          xMin,
          yMin,
          width,
          height
        }
      }
    })

    // Log detection results
    console.log('Detected faces:', faces.length, 'with boxes:', faces.map(f => f.box))

    // Cleanup
    tf.dispose(tensor)
    
    return faces
  } catch (error) {
    console.error('Face detection error:', error)
    return []
  }
}

// Remove unused createImageData function as it uses browser-only APIs 
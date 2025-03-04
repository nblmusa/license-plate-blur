import { Router } from 'express';
import multer from 'multer';
import { detectionService } from '../services/detection';
import { ApiError } from '../middleware/error';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new ApiError(400, 'Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

export const detectRouter = Router();

detectRouter.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No image file provided');
    }

    const maskType = req.body.maskType === 'solid' ? 'solid' : 'blur';
    const options = {
      blurRadius: parseInt(req.body.blurRadius) || 30,
      blurOpacity: parseFloat(req.body.blurOpacity) || 1,
      maskType: maskType as 'blur' | 'solid'
    };

    const result = await detectionService.detectAndMask(
      req.file.buffer,
      options
    );

    res.json({
      success: true,
      data: {
        detectedPlates: result.detectedPlates,
        processedImage: result.processedImage.toString('base64'),
        thumbnail: result.thumbnail.toString('base64')
      }
    });
  } catch (error) {
    next(error);
  }
}); 
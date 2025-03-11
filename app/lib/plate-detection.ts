import * as tf from '@tensorflow/tfjs-node';
import { Detection } from './image-processing';

export async function detectPlates(
  tensor: tf.Tensor4D,
  paddingX: number,
  paddingY: number,
  xRatio: number,
  yRatio: number
): Promise<Detection[]> {
  // Load license plate detection model
  const model = await tf.loadGraphModel('file://./models/license_plate_model/model.json');
  
  // Get predictions
  const predictions = await model.predict(tensor) as tf.Tensor2D;
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

  // Convert detections to normalized coordinates
  const detections: Detection[] = [];
  const boxesArray = Array.from(boxes_data);
  const scoresArray = Array.from(scores_data);

  scoresArray.forEach((score, i) => {
    if (score <= 0.1) return;

    let [y1, x1, y2, x2] = boxesArray.slice(i * 4, (i + 1) * 4);
    
    // Remove padding offset and scale coordinates back to original image size
    x1 = Math.round((x1 - paddingX) * xRatio);
    x2 = Math.round((x2 - paddingX) * xRatio);
    y1 = Math.round((y1 - paddingY) * yRatio);
    y2 = Math.round((y2 - paddingY) * yRatio);

    detections.push({
      x1,
      y1,
      x2,
      y2,
      confidence: score
    });
  });

  return detections;
}

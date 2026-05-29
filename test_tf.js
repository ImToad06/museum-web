const tf = require('@tensorflow/tfjs');
const data = [[[1, 2, 3]]]; // 1x1x3
const t = tf.tensor(data).reshape([1, 1, 1, 3]);
console.log(t.shape);

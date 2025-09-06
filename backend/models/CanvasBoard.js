const mongoose = require('mongoose');

const patchSchema = new mongoose.Schema({
  id: { type: String, required: true },
  x: Number,
  y: Number,
  w: Number,
  h: Number,
  color: String,
  opacity: Number,
}, { _id: false });

const canvasBoardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, unique: true },
  imageUrl: { type: String, default: '' },
  patches: { type: [patchSchema], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

canvasBoardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CanvasBoard', canvasBoardSchema);

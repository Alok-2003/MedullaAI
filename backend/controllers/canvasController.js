const jwt = require('jsonwebtoken');
const CanvasBoard = require('../models/CanvasBoard');

// GET /api/canvas - get or create current user's board
exports.getBoard = async (req, res) => {
  try {
    let board = await CanvasBoard.findOne({ user: req.user.id });
    if (!board) {
      board = await CanvasBoard.create({ user: req.user.id, imageUrl: '', patches: [] });
    }
    res.json({ success: true, board });
  } catch (err) {
    console.error('getBoard error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// PUT /api/canvas - update patches/imageUrl
exports.updateBoard = async (req, res) => {
  try {
    const { imageUrl, patches } = req.body || {};
    const update = { updatedAt: new Date() };
    if (Array.isArray(patches)) update.patches = patches;
    if (typeof imageUrl === 'string') update.imageUrl = imageUrl;

    const board = await CanvasBoard.findOneAndUpdate(
      { user: req.user.id },
      { $set: update },
      { new: true, upsert: true }
    );

    // Emit via socket.io if available (other sessions of same user)
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(String(req.user.id)).emit('board:update', { imageUrl: board.imageUrl, patches: board.patches });
      }
    } catch (_) {}

    res.json({ success: true, board });
  } catch (err) {
    console.error('updateBoard error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

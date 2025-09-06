const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getBoard, updateBoard } = require('../controllers/canvasController');

router.get('/', protect, getBoard);
router.put('/', protect, updateBoard);

module.exports = router;

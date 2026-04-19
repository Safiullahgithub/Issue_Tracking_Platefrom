const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Serve file info endpoint
router.get('/info/:filename', (req, res) => {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({ exists: true, size: stats.size, modified: stats.mtime });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;

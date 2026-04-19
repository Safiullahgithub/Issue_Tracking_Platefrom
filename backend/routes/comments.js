const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getCommentsByIssue, addComment, updateComment, deleteComment
} = require('../controllers/commentController');

router.use(authenticate);

router.get('/issue/:issueId', getCommentsByIssue);
router.post('/issue/:issueId', addComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;

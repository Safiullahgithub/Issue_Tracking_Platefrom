const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadAny, handleUploadError } = require('../middleware/upload');
const {
  getAllIssues, getIssueById, createIssue,
  updateIssue, deleteIssue, uploadAttachment, deleteAttachment
} = require('../controllers/issueController');

router.use(authenticate);

router.get('/', getAllIssues);
router.get('/:id', getIssueById);
router.post('/', handleUploadError(uploadAny.array('attachments', 5)), createIssue);
router.put('/:id', updateIssue);
router.patch('/:id', updateIssue);
router.delete('/:id', deleteIssue);

router.post('/:id/attachments', handleUploadError(uploadAny.single('file')), uploadAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

module.exports = router;

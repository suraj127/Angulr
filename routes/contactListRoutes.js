const express = require('express');
const router = express.Router();
const {
  createContactList,
  getContactLists,
  getContactListById,
  uploadContacts,
  upload,
} = require('../controllers/contactListController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createContactList).get(protect, getContactLists);
router.route('/:id').get(protect, getContactListById);
router
  .route('/:id/contacts')
  .post(protect, upload.single('file'), uploadContacts);

module.exports = router;

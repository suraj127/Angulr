const ContactList = require('../models/contactListModel');
const Contact = require('../models/contactModel');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');

// @desc    Create new contact list
// @route   POST /api/lists
// @access  Private
const createContactList = async (req, res, next) => {
  try {
    const { listName } = req.body;

    if (!listName) {
      res.status(400);
      throw new Error('Please provide a list name');
    }

    const contactList = await ContactList.create({
      listName,
      user: req.user._id,
    });

    res.status(201).json(contactList);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user contact lists
// @route   GET /api/lists
// @access  Private
const getContactLists = async (req, res, next) => {
  try {
    const contactLists = await ContactList.find({ user: req.user._id });
    res.json(contactLists);
  } catch (error) {
    next(error);
  }
};

// @desc    Get contact list by ID
// @route   GET /api/lists/:id
// @access  Private
const getContactListById = async (req, res, next) => {
  try {
    const contactList = await ContactList.findById(req.params.id);

    if (!contactList) {
      res.status(404);
      throw new Error('Contact list not found');
    }

    if (contactList.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this list');
    }

    const contacts = await Contact.find({ contactList: req.params.id });

    res.json({ contactList, contacts });
  } catch (error) {
    next(error);
  }
};


// @desc    Upload contacts from CSV
// @route   POST /api/lists/:id/contacts
// @access  Private
const uploadContacts = async (req, res, next) => {
  try {
    const contactListId = req.params.id;
    const results = [];

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a CSV file');
    }

    fs.createReadStream(req.file.path)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const contacts = results.map((result) => ({
            name: result.Name,
            phoneNumber: result['Phone Number'],
            contactList: contactListId,
          }));

          await Contact.insertMany(contacts);
          fs.unlinkSync(req.file.path); // Clean up the uploaded file
          res.status(201).json({ message: 'Contacts uploaded successfully' });
        } catch (error) {
          next(error);
        }
      });
  } catch (error) {
    next(error);
  }
};

const upload = multer({ dest: 'uploads/' });

module.exports = {
  createContactList,
  getContactLists,
  getContactListById,
  uploadContacts,
  upload,
};

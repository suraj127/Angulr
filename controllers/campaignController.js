const Campaign = require('../models/campaignModel');
const Contact = require('../models/contactModel');
const Message = require('../models/messageModel');
const { campaignQueue } = require('../services/queue');

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private
const createCampaign = async (req, res, next) => {
  try {
    const { campaignName, messageBody, imageUrl, contactListId, delayInSeconds } =
      req.body;

    if (!campaignName || !messageBody || !contactListId || !delayInSeconds) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    const campaign = await Campaign.create({
      campaignName,
      messageBody,
      imageUrl,
      contactList: contactListId,
      delayInSeconds,
      user: req.user._id,
      status: 'pending',
    });

    const contacts = await Contact.find({ contactList: contactListId });

    const messages = contacts.map((contact) => ({
      campaign: campaign._id,
      contact: contact._id,
      status: 'queued',
    }));

    const createdMessages = await Message.insertMany(messages);

    for (let i = 0; i < createdMessages.length; i++) {
      const message = createdMessages[i];
      const contact = contacts.find(c => c._id.equals(message.contact));
      const jobData = {
        messageId: message._id,
        contactPhoneNumber: contact.phoneNumber,
        messageBody: messageBody.replace('{{name}}', contact.name),
        imageUrl,
      };
      const delay = i * delayInSeconds * 1000;
      await campaignQueue.add(campaign.id, jobData, { delay });
    }

    campaign.status = 'running';
    await campaign.save();

    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all campaigns for a user
// @route   GET /api/campaigns
// @access  Private
const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ user: req.user._id });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a campaign by ID
// @route   GET /api/campaigns/:id
// @access  Private
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      res.status(404);
      throw new Error('Campaign not found');
    }

    if (campaign.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this campaign');
    }

    const messages = await Message.find({ campaign: req.params.id }).populate(
      'contact',
      'name phoneNumber'
    );

    res.json({ campaign, messages });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
};

const { Worker } = require('bullmq');
const Message = require('../models/messageModel');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

const processor = async (job) => {
  const { messageId, contactPhoneNumber, messageBody, imageUrl } = job.data;

  try {
    console.log(`Sending message to ${contactPhoneNumber}...`);
    console.log(`Message: ${messageBody}`);
    if (imageUrl) {
      console.log(`Image: ${imageUrl}`);
    }

    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call time

    // Here you would get the real whatsappMessageId from the API response
    const whatsappMessageId = `fake-whatsapp-id-${messageId}`;

    await Message.findByIdAndUpdate(messageId, {
      status: 'sent',
      whatsappMessageId,
    });

    console.log(`Message sent to ${contactPhoneNumber}`);
  } catch (error) {
    console.error('Error processing job:', error);
    await Message.findByIdAndUpdate(messageId, { status: 'failed' });
    throw error; // Re-throw the error to make sure the job is marked as failed
  }
};

const worker = new Worker('campaigns', processor, {
  connection,
  concurrency: 1, // Process one job at a time
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed.`);
});

worker.on('failed', async (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
  // The processor already handles updating the status to 'failed'
  // If the processor itself fails before that, we can do it here as a fallback.
  if (job.data.messageId) {
    await Message.findByIdAndUpdate(job.data.messageId, { status: 'failed' });
  }
});

console.log('Worker started...');

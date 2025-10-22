const Donation = require('../models/Donation');
const { sendMail } = require('../utils/mail');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const AppError = require('../utils/AppError');

const createDonation = async (donationData) => {
  try {
    const { donorId, campaignId, amount, paymentMethod } = donationData;
    if (!amount || !campaignId || !donorId) {
      throw new AppError('Please provide all required fields', 400);
    }

    const allowedMethods = ['momo', 'paypal', 'bank'];
    if (!allowedMethods.includes(paymentMethod)) {
        throw new AppError('Invalid payment method', 400);
    }

    const campaign = await Campaign.findOne({ _id: campaignId, status: 'approved' });
    if (!campaign) {
      throw new AppError('Campaign not found or not approved', 404);
    }

    const newDonation = await Donation.create({
        donorId,
        campaignId,
        amount,
        paymentMethod,
        status: 'success'
    });

    campaign.collectedAmount += amount;

    await campaign.save();

    const goal = campaign.goalAmount;
    if (campaign.collectedAmount >= goal) {
        const organizer = await User.findById(campaign.createdBy);
        await sendMail({
            to: organizer.email,
            subject: 'Campaign Goal Reached!',
            text: `Congratulations! Your campaign "${campaign.title}" has reached its goal of ${goal}. Keep up the great work!`
        });
    }

    const donor = await User.findById(donorId);
    if (donor && donor.email) {
    await sendMail({
        to: donor.email,
        subject: 'Thank you for your donation!',
        text: `Dear ${donor.name || 'Donor'},\n\nThank you for your generous donation of ${amount} to the campaign "${campaign.title}". Your support makes a real difference!\n\nBest regards,\nDonation Team`
    });
    }

    return newDonation;

  } catch (error) {
    throw error;
  }
};

const myDonations = async ({ donorId, limit = 10, page = 1 } = {}) => {
  try {
    const donations = await Donation.find({ donorId })
      .populate('campaignId', 'title description')
      .limit(limit)
      .skip((page - 1) * limit);

    total = await Donation.countDocuments({ donorId });
    return {
      total,
      currentPage: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      data: donations
    };
  } catch (error) {
    throw error;
  }
};

const getDonationsByCampaign = async ({ campaignId, limit = 10, page = 1 }) => {
  try {
    const donations = await Donation.find({ campaignId })
      .populate('donorId', 'name email')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Donation.countDocuments({ campaignId });
    return {
      total,
      currentPage: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      data: donations
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createDonation,
  myDonations,
  getDonationsByCampaign
};

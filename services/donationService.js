const Donation = require('../models/Donation');
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

    const donor = await User.findById(donorId);
    if (donor && donor.email) {
    await sendMail({
        to: donor.email,
        subject: 'Cảm ơn bạn đã quyên góp!',
        text: `Bạn đã quyên góp thành công ${amount} cho chiến dịch "${campaign.title}". Xin chân thành cảm ơn!`
    });
    }

    return newDonation;

  } catch (error) {
    throw new AppError('Error creating donation', 500);
  }
};

module.exports = {
  createDonation
};

const User = require('../models/User');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
  const { email, password, name } = userData;

  if (!name || !email || !password) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const userResponse = newUser.toObject();
  delete userResponse.password;
  return { user: userResponse };
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const userResponse = user.toObject();
  delete userResponse.password;
  return { user: userResponse, token };
};

module.exports = {
  registerUser,
  loginUser
};
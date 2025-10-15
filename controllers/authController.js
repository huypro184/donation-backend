const { registerUser, loginUser, getMe } = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');

const getCookieOptions = () => {
    const expiresIn = Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN);
    
    return {
        httpOnly: true,
        expires: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };
};

const register = asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result

    });
});

const login = asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);

    res.cookie('jwt', result.token, getCookieOptions());

    res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result
    });
});

const me = asyncHandler(async (req, res) => {
    const result = await getMe(req.user);

    res.status(200).json({
        status: 'success',
        message: 'User retrieved successfully',
        data: result
    });
});

module.exports = {
    register,
    login,
    me
};

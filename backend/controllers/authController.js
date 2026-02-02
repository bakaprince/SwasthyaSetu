const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { abhaId, name, mobile, email, password, dateOfBirth, gender, bloodGroup, address, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ abhaId }, { mobile }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this ABHA ID or mobile already exists'
            });
        }

        // Create user
        const user = await User.create({
            abhaId,
            name,
            mobile,
            email,
            password,
            dateOfBirth,
            gender,
            bloodGroup,
            address,
            role: role || 'patient'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                abhaId: user.abhaId,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { abhaId, mobile, password } = req.body;

        // Validate input
        if (!password || (!abhaId && !mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide ABHA ID or mobile and password'
            });
        }

        // Find user (include password for comparison)
        const user = await User.findOne({
            $or: [{ abhaId }, { mobile }]
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user._id,
                abhaId: user.abhaId,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                age: user.age,
                gender: user.gender,
                role: user.role,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify token
 * @route   GET /api/auth/verify
 * @access  Private
 */
const verifyToken = async (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            id: req.user._id,
            abhaId: req.user.abhaId,
            name: req.user.name,
            role: req.user.role
        }
    });
};

module.exports = {
    register,
    login,
    getMe,
    verifyToken
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const governmentUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        default: 'Health Ministry'
    },
    role: {
        type: String,
        default: 'government',
        immutable: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    }
}, {
    timestamps: true
});

// Hash password before saving
governmentUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    // HACKATHON OPTIMIZATION: Reduced from 10 to 4 for Render shared CPU performance
    // REVERT AFTER HACKATHON: Change back to 10 for production security
    const salt = await bcrypt.genSalt(4); // Was: bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// Method to compare password
governmentUserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('GovernmentUser', governmentUserSchema);

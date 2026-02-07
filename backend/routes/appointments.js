const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const {
    getAppointments,
    getHospitalAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    uploadDocument,
    deleteDocument,
    handleTransfer
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validation');

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/reports/');
    },
    filename: function (req, file, cb) {
        // Unique filename: doc-APPOINTMENT_ID-TIMESTAMP.ext
        cb(null, `doc-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept PDFs and Images
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Patient routes
router.get('/', protect, getAppointments);
router.post('/', protect, authorize('patient'), validateAppointment, createAppointment);
router.delete('/:id', protect, cancelAppointment);

// Hospital admin routes
router.get('/hospital', protect, authorize('admin'), getHospitalAppointments);
router.put('/:id', protect, authorize('admin'), updateAppointment);

// Document Upload Route (Admin Only)
router.post('/:id/documents', protect, authorize('admin'), upload.single('file'), uploadDocument);

// Document Delete Route (Admin Only)
router.delete('/:id/documents/:docIndex', protect, authorize('admin'), deleteDocument);

// Transfer Route (Admin Only)
router.put('/:id/transfer', protect, authorize('admin'), handleTransfer);

module.exports = router;

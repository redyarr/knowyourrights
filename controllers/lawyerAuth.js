const Lawyer = require('../models/lawyer');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/badges/'); // Directory to save badge images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

// Initialize upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG files are allowed.'), false);
        }
    }
}).single('badgeImage'); // 'badgeImage' is the field name for the file input

exports.registerLawyer = async (req, res) => {
    try {
        const { firstName, lastName, email, password, lawFirm, licenseNumber, authority, summary, badgeId, badgeIssueDate, badgeExpiryDate, university, degreeLevel } = req.body;

        // Basic validation (more comprehensive validation including file upload will be added later)
        if (!firstName || !lastName || !email || !password || !lawFirm || !licenseNumber || !authority || !badgeIssueDate || !university || !degreeLevel) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // Check if lawyer with this email or license number already exists
        const existingLawyer = await Lawyer.findOne({ where: { email: email } });
        if (existingLawyer) {
            return res.status(400).json({ message: 'Lawyer with this email already exists.' });
        }

        const existingLicense = await Lawyer.findOne({ where: { licenseNumber: licenseNumber } });
        if (existingLicense) {
            return res.status(400).json({ message: 'Lawyer with this license number already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle badge image upload
        upload(req, res, async (err) => {
            if (err) {
                console.error('File upload error:', err);
                return res.status(400).json({ message: err.message });
            }

            // Check if file was uploaded
            if (!req.file) {
                // If badge is optional, you might not return an error here
                // For now, assuming badge is required for approval process
                return res.status(400).json({ message: 'Badge image is required.' });
            }

            const badgeImagePath = req.file.path;

            // Create new lawyer with 'pending' status and badge image path
            const newLawyer = await Lawyer.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                lawFirm,
                licenseNumber,
                authority,
                summary,
                badgeId,
                badgeIssueDate,
                badgeExpiryDate,
                badgeImagePath: badgeImagePath, // Save the file path
                status: 'pending', // Default status
                submissionTimestamp: new Date(),
                university,
                degreeLevel
            });

            res.status(201).json({ message: 'Lawyer registered successfully. Awaiting admin approval.', lawyer: newLawyer });
        });

    } catch (error) {
        console.error('Lawyer registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
}

exports.renderResubmitForm = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const lawyer = await Lawyer.findByPk(lawyerId);

        if (!lawyer) {
            return res.status(404).render('error', { error: 'Lawyer not found.' });
        }

        // Only allow resubmission if status is 'declined'
        if (lawyer.status !== 'declined') {
            return res.status(400).render('error', { error: 'Lawyer is not in declined status and cannot resubmit.' });
        }

        // Render the resubmit form, passing lawyer data
        res.render('lawyer/resubmit', { lawyer: lawyer, error: null });

    } catch (error) {
        console.error('Error rendering resubmission form:', error);
        res.status(500).render('error', { error: 'An error occurred while loading the resubmission form.' });
    }
};

exports.resubmitLawyer = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error during resubmission:', err);
            return res.status(400).json({ message: err.message });
        }

        try {
            const lawyerId = req.params.id;
            const { firstName, lastName, email, password, lawFirm, licenseNumber, authority, summary, badgeId, badgeIssueDate, badgeExpiryDate, university, degreeLevel } = req.body;

            const lawyer = await Lawyer.findByPk(lawyerId);

            if (!lawyer) {
                // If an error occurs after file upload, you might want to delete the uploaded file
                if (req.file && req.file.path) {
                    // Add file deletion logic here if needed
                }
                return res.status(404).json({ message: 'Lawyer not found.' });
            }

            // Only allow resubmission if status is 'declined'
            if (lawyer.status !== 'declined') {
                 if (req.file && req.file.path) {
                    // Add file deletion logic here if needed
                }
                return res.status(400).json({ message: 'Lawyer is not in declined status and cannot resubmit.' });
            }

            let badgeImagePath = lawyer.badgeImagePath; // Keep existing path if no new file uploaded
            if (req.file) {
                badgeImagePath = req.file.path; // Use new path if file uploaded
                // TODO: Optionally delete old badge image file
            }

            // Update lawyer information
            lawyer.firstName = firstName || lawyer.firstName;
            lawyer.lastName = lastName || lawyer.lastName;
            // Consider if email should be updatable after initial registration and add validation if needed
            // lawyer.email = email || lawyer.email;
            // Only update password if a new one is provided
            if (password) {
                lawyer.password = await bcrypt.hash(password, 10);
            }
            lawyer.lawFirm = lawFirm || lawyer.lawFirm;
            // Consider if license number should be updatable and add validation if needed
            // lawyer.licenseNumber = licenseNumber || lawyer.licenseNumber;
            lawyer.authority = authority || lawyer.authority;
            lawyer.summary = summary || lawyer.summary;
            lawyer.badgeId = badgeId || lawyer.badgeId;
            lawyer.badgeIssueDate = badgeIssueDate || lawyer.badgeIssueDate;
            lawyer.badgeExpiryDate = badgeExpiryDate || lawyer.badgeExpiryDate;
            lawyer.badgeImagePath = badgeImagePath;
            lawyer.status = 'pending'; // Set status back to pending
            lawyer.rejectionReason = null; // Clear rejection reason
            lawyer.declineTimestamp = null; // Clear decline timestamp
            lawyer.submissionTimestamp = new Date(); // Update submission timestamp
            // approvalTimestamp remains as it was or is cleared depending on desired history tracking

            await lawyer.save();

            res.status(200).json({ message: 'Lawyer application resubmitted successfully. Awaiting admin approval.', lawyer });

        } catch (error) {
            console.error('Error resubmitting lawyer application:', error);
            // If an error occurs after file upload, you might want to delete the uploaded file
            if (req.file && req.file.path) {
                // Add file deletion logic here if needed
            }
            res.status(500).json({ message: 'Server error during resubmission.' });
        }
    });
};
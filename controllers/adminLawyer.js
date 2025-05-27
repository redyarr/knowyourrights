const Lawyer = require('../models/lawyer');
const { sendEmail } = require('../util/email');

// Get all pending lawyers
exports.getPendingLawyers = async (req, res) => {
    try {
        const pendingLawyers = await Lawyer.findAll({
            where: { status: 'pending' }
        });
        res.render('admin/lawyers/pending', { lawyers: pendingLawyers });
    } catch (error) {
        console.error('Error fetching pending lawyers:', error);
        res.status(500).json({ message: 'Server error fetching pending lawyers.' });
    }
};

// Get lawyer details
exports.getLawyerDetails = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const lawyer = await Lawyer.findByPk(lawyerId);

        if (!lawyer) {
            return res.status(404).render('admin/lawyers/detail', { lawyer: null, error: 'Lawyer not found.' });
        }

        res.render('admin/lawyers/detail', { lawyer: lawyer });

    } catch (error) {
        console.error('Error fetching lawyer details:', error);
        res.status(500).render('admin/lawyers/detail', { lawyer: null, error: 'Server error fetching lawyer details.' });
    }
};

// Approve a lawyer
exports.approveLawyer = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const lawyer = await Lawyer.findByPk(lawyerId);

        if (!lawyer) {
            return res.status(404).json({ message: 'Lawyer not found.' });
        }

        if (lawyer.status !== 'pending') {
            return res.status(400).json({ message: 'Lawyer is not in pending status.' });
        }

        lawyer.status = 'approved';
        lawyer.approvalTimestamp = new Date();
        await lawyer.save();

        // Send approval email
        await sendEmail(lawyer.email, 'Your lawyer profile has been approved', 'Congratulations! Your lawyer profile has been approved. You now have full access to the platform features.');

        res.redirect('/admin/lawyers/pending');

    } catch (error) {
        console.error('Error approving lawyer:', error);
        res.status(500).json({ message: 'Server error approving lawyer.' });
    }
};

// Get lawyer details
exports.getLawyerDetails = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const lawyer = await Lawyer.findByPk(lawyerId);

        if (!lawyer) {
            return res.status(404).render('admin/lawyers/detail', { lawyer: null, error: 'Lawyer not found.' });
        }

        res.render('admin/lawyers/detail', { lawyer: lawyer });

    } catch (error) {
        console.error('Error fetching lawyer details:', error);
        res.status(500).render('admin/lawyers/detail', { lawyer: null, error: 'Server error fetching lawyer details.' });
    }
};

// Decline a lawyer
exports.declineLawyer = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({ message: 'Rejection reason is required.' });
        }

        const lawyer = await Lawyer.findByPk(lawyerId);

        if (!lawyer) {
            return res.status(404).json({ message: 'Lawyer not found.' });
        }

        if (lawyer.status !== 'pending') {
            return res.status(400).json({ message: 'Lawyer is not in pending status.' });
        }

        lawyer.status = 'declined';
        lawyer.rejectionReason = rejectionReason;
        lawyer.declineTimestamp = new Date();
        await lawyer.save();

        // Send decline email with reason
        await sendEmail(lawyer.email, 'Your lawyer registration was declined', `Your registration was declined. Reason: ${rejectionReason}. Please correct and resubmit.`);

        res.redirect('/admin/lawyers/pending');

    } catch (error) {
        console.error('Error declining lawyer:', error);
        res.status(500).json({ message: 'Server error declining lawyer.' });
    }
};

// Get lawyer details
exports.getLawyerDetails = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const lawyer = await Lawyer.findByPk(lawyerId);

        if (!lawyer) {
            return res.status(404).render('admin/lawyers/detail', { lawyer: null, error: 'Lawyer not found.' });
        }

        res.render('admin/lawyers/detail', { lawyer: lawyer });

    } catch (error) {
        console.error('Error fetching lawyer details:', error);
        res.status(500).render('admin/lawyers/detail', { lawyer: null, error: 'Server error fetching lawyer details.' });
    }
};
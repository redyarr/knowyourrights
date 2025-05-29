const { User, Lawyer, Notification } = require('../models');
const { Op } = require('sequelize');

class AdminController {
    /**
     * Display admin dashboard with pending lawyer verifications
     */
    static async dashboard(req, res) {
        try {
            const pendingLawyers = await Lawyer.findAll({
                where: {
                    verificationStatus: 'pending'
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }],
                order: [['id', 'DESC']]
            });

            const recentlyVerified = await Lawyer.findAll({
                where: {
                    verificationStatus: {
                        [Op.in]: ['approved', 'rejected']
                    }
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }],
                order: [['verificationDate', 'DESC']],
                limit: 10
            });

            res.render('admin/dashboard', {
                pendingLawyers,
                recentlyVerified,
                user: res.locals.user,
                path: req.path
            });
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            res.status(500).render('error', {
                message: 'Error loading dashboard',
                error: { status: 500 }
            });
        }
    }

    /**
     * Display detailed view of a lawyer for verification
     */
    static async viewLawyerDetails(req, res) {
        try {
            const { lawyerId } = req.params;

            const lawyer = await Lawyer.findByPk(lawyerId, {
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
                }]
            });

            if (!lawyer) {
                return res.status(404).render('error', {
                    message: 'Lawyer not found',
                    error: { status: 404 }
                });
            }

            res.render('admin/lawyer-details', {
                lawyer,
                user: res.locals.user,
                path: req.path
            });
        } catch (error) {
            console.error('Error loading lawyer details:', error);
            res.status(500).render('error', {
                message: 'Error loading lawyer details',
                error: { status: 500 }
            });
        }
    }

    /**
     * Approve a lawyer's verification
     */
    static async approveLawyer(req, res) {
        try {
            const { lawyerId } = req.params;
            const adminId = res.locals.user.id;

            const lawyer = await Lawyer.findByPk(lawyerId, {
                include: [{
                    model: User,
                    as: 'user'
                }]
            });

            if (!lawyer) {
                return res.status(404).json({
                    success: false,
                    message: 'Lawyer not found'
                });
            }

            if (lawyer.verificationStatus !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Lawyer verification is not pending'
                });
            }

            // Update lawyer verification status
            await lawyer.update({
                verificationStatus: 'approved',
                verifiedBy: adminId,
                verificationDate: new Date(),
                rejectionReason: null
            });

            // Create notification for the lawyer
            await Notification.create({
                userId: lawyer.userId,
                type: 'verification_approved',
                message: 'Congratulations! Your lawyer verification has been approved. You can now post and connect with other users.',
                isRead: false
            });

            res.json({
                success: true,
                message: 'Lawyer approved successfully'
            });
        } catch (error) {
            console.error('Error approving lawyer:', error);
            res.status(500).json({
                success: false,
                message: 'Error approving lawyer'
            });
        }
    }

    /**
     * Reject a lawyer's verification
     */
    static async rejectLawyer(req, res) {
        try {
            const { lawyerId } = req.params;
            const { reason } = req.body;
            const adminId = res.locals.user.id;

            if (!reason || reason.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required'
                });
            }

            const lawyer = await Lawyer.findByPk(lawyerId, {
                include: [{
                    model: User,
                    as: 'user'
                }]
            });

            if (!lawyer) {
                return res.status(404).json({
                    success: false,
                    message: 'Lawyer not found'
                });
            }

            if (lawyer.verificationStatus !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Lawyer verification is not pending'
                });
            }

            // Update lawyer verification status
            await lawyer.update({
                verificationStatus: 'rejected',
                verifiedBy: adminId,
                verificationDate: new Date(),
                rejectionReason: reason.trim()
            });

            // Create notification for the lawyer
            await Notification.create({
                userId: lawyer.userId,
                type: 'verification_rejected',
                message: `Your lawyer verification has been rejected. Reason: ${reason.trim()}. Please update your information and resubmit.`,
                isRead: false
            });

            res.json({
                success: true,
                message: 'Lawyer rejected successfully'
            });
        } catch (error) {
            console.error('Error rejecting lawyer:', error);
            res.status(500).json({
                success: false,
                message: 'Error rejecting lawyer'
            });
        }
    }

    /**
     * Get all lawyers with their verification status
     */
    static async getAllLawyers(req, res) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = {};
            if (status && ['pending', 'approved', 'rejected'].includes(status)) {
                whereClause.verificationStatus = status;
            }

            const lawyers = await Lawyer.findAndCountAll({
                where: whereClause,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }],
                order: [['id', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            const totalPages = Math.ceil(lawyers.count / limit);

            res.render('admin/lawyers-list', {
                lawyers: lawyers.rows,
                currentPage: parseInt(page),
                totalPages,
                totalCount: lawyers.count,
                currentStatus: status,
                user: res.locals.user,
                path: req.path
            });
        } catch (error) {
            console.error('Error loading lawyers list:', error);
            res.status(500).render('error', {
                message: 'Error loading lawyers list',
                error: { status: 500 }
            });
        }
    }
}

module.exports = AdminController;
const { User, Lawyer } = require('../models');

/**
 * Middleware to check if a lawyer is verified before allowing certain actions
 */
const isVerifiedLawyer = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user_id) {
            return res.redirect('/login');
        }

        const user = await User.findByPk(req.session.user_id, {
            include: [{
                model: Lawyer,
                as: 'lawyer'
            }]
        });

        if (!user) {
            return res.redirect('/login');
        }

        // If user is not a lawyer, allow access
        if (user.role !== 'lawyer') {
            return next();
        }

        // If user is a lawyer, check verification status
        if (!user.lawyer) {
            return res.status(403).render('error', {
                message: 'Lawyer profile not found',
                error: { status: 403 }
            });
        }

        if (user.lawyer.verificationStatus === 'pending') {
            return res.render('lawyer/pending-verification', {
                user: user,
                lawyer: user.lawyer
            });
        }

        if (user.lawyer.verificationStatus === 'rejected') {
            return res.render('lawyer/verification-rejected', {
                user: user,
                lawyer: user.lawyer,
                rejectionReason: user.lawyer.rejectionReason
            });
        }

        if (user.lawyer.verificationStatus === 'approved') {
            return next();
        }

        // Default case - should not reach here
        return res.status(403).render('error', {
            message: 'Access denied',
            error: { status: 403 }
        });

    } catch (error) {
        console.error('Error in lawyer verification middleware:', error);
        return res.status(500).render('error', {
            message: 'Internal server error',
            error: { status: 500 }
        });
    }
};

/**
 * Middleware to check if user is an admin
 */
const isAdmin = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user_id) {
            return res.redirect('/login');
        }

        const user = await User.findByPk(req.session.user_id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).render('error', {
                message: 'Admin access required',
                error: { status: 403 }
            });
        }

        return next();
    } catch (error) {
        console.error('Error in admin middleware:', error);
        return res.status(500).render('error', {
            message: 'Internal server error',
            error: { status: 500 }
        });
    }
};

module.exports = {
    isVerifiedLawyer,
    isAdmin
};
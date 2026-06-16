const {User} = require('../models')

const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user_id) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        details: 'Please login to access this resource'
      }
    });
  }
  return next();
};
const isVerifiedLawyer = async (req, res, next) => {
    try {
        // Check if user exists in database with lawyer details
        const user = await User.findByPk(req.session.user_id, {
            include: ['lawyer']
        });

        // Handle various authentication and verification scenarios
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'Unable to authenticate user. Please login again.',
                    details: 'User session is invalid or expired'
                }
            });
        }

        if (user.role !== 'lawyer') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED_ROLE',
                    message: 'Access restricted to verified lawyers only',
                    details: 'Current user role does not have sufficient permissions'
                }
            });
        }

        if (!user.lawyer) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'INCOMPLETE_PROFILE',
                    message: 'Lawyer profile is incomplete',
                    details: 'Please complete your lawyer registration process'
                }
            });
        }

        // Enhanced verification status handling
        const verificationResponses = {
            approved: () => next(),
            pending: {
                success: false,
                error: {
                    code: 'VERIFICATION_PENDING',
                    message: 'Your lawyer account is pending verification',
                    details: 'Please wait while our team reviews your credentials'
                }
            },
            rejected: {
                success: false,
                error: {
                    code: 'VERIFICATION_REJECTED',
                    message: 'Your lawyer verification was unsuccessful',
                    details: 'Please contact support for more information'
                }
            },
            default: {
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: 'Invalid verification status detected',
                    details: 'Please contact support to resolve this issue'
                }
            }
        };

        const status = user.lawyer.verificationStatus;
        if (status === 'approved') {
            return verificationResponses[status]();
        }
        
        return res.status(403).json(
            verificationResponses[status] || verificationResponses.default
        );

    } catch (error) {
        console.error('Lawyer verification middleware error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                details: 'Please try again later or contact support if the problem persists'
            }
        });
    }
};


const isAuthenticatedAdmin = (req, res, next) => {
  if (req.session && req.session.user_id) {
    User.findOne({where:{id: req.session.user_id}})
      .then(user => {
        if (user && user.role === 'admin') {
          return next();
        }
        res.redirect('/');
      })
      .catch(err => {
        console.error('Error in admin authentication:', err);
        res.redirect('/');
      });
  } else {
    res.redirect('/login');
  }
};



module.exports = { isAuthenticated, isAuthenticatedAdmin, isVerifiedLawyer };

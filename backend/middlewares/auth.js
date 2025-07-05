const {User} = require('../models')

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user_id) {
    return next();
  }
  res.send({
    message: 'You are not authorized',
    status: 'error'
  });
};

const isVerifiedLawyer = async (req, res, next) => {
    try {
        // Check if user exists in database
        const user = await User.findByPk(req.session.user_id, {
            include: ['lawyer']
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                status: 'error'
            });
        }

        // Check if user is a lawyer
        if (user.role !== 'lawyer') {
            return res.status(403).json({
                message: 'User is not a lawyer',
                status: 'error'
            });
        }

        // Verify lawyer details exist
        if (!user.lawyer) {
            return res.status(403).json({
                message: 'Lawyer details not found',
                status: 'error'
            });
        }

        // Check verification status
        switch (user.lawyer.verificationStatus) {
            case 'approved':
                return next();
            case 'pending':
                return res.status(403).json({
                    message: 'Your verification is pending',
                    status: 'error'
                });
            case 'rejected':
                return res.status(403).json({
                    message: 'Your verification was rejected',
                    status: 'error'
                });
            default:
                return res.status(403).json({
                    message: 'Invalid verification status',
                    status: 'error'
                });
        }

    } catch (error) {
        console.error('Lawyer verification middleware error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            status: 'error'
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

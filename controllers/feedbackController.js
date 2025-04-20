const { User, Lawyer, LawyerFeedback } = require('../models');

exports.submitFeedback = async (req, res) => {
    try {
        const { lawyerId, rating, review } = req.body;
        const userId = req.session.user.id;

        // Check if lawyer exists
        const lawyer = await Lawyer.findByPk(lawyerId);
        if (!lawyer) {
            return res.status(404).json({ message: 'Lawyer not found' });
        }

        // Check if user has already submitted feedback for this lawyer
        const existingFeedback = await LawyerFeedback.findOne({
            where: {
                user_id: userId,
                lawyer_id: lawyerId
            }
        });


        if (existingFeedback) {
            // Update existing feedback
            existingFeedback.rating = rating;
            existingFeedback.review = review;
            await existingFeedback.save();
            return res.status(200).json({ message: 'Feedback updated successfully', feedback: existingFeedback });
        }

        // Create new feedback
        const feedback = await LawyerFeedback.create({
            user_id: userId,
            lawyer_id: lawyerId,
            rating,
            review
        });

        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getLawyerFeedback = async (req, res) => {
    try {
        const { lawyerId } = req.params;

        // Check if lawyer exists
        const lawyer = await Lawyer.findByPk(lawyerId);
        if (!lawyer) {
            return res.status(404).json({ message: 'Lawyer not found' });
        }

        // Get all feedback for the lawyer
        const feedback = await LawyerFeedback.findAll({
            where: { lawyer_id: lawyerId },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email']
            }],
            order: [['created_at', 'DESC']]
        });

        // Calculate average rating
        const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = feedback.length > 0 ? (totalRating / feedback.length).toFixed(1) : 0;

        res.status(200).json({
            feedback,
            averageRating,
            totalReviews: feedback.length
        });
    } catch (error) {
        console.error('Error getting lawyer feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserFeedback = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Get all feedback submitted by the user
        const feedback = await LawyerFeedback.findAll({
            where: { user_id: userId },
            include: [{
                model: Lawyer,
                include: [{
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({ feedback });
    } catch (error) {
        console.error('Error getting user feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const userId = req.session.user.id;

        // Find the feedback
        const feedback = await LawyerFeedback.findByPk(feedbackId);
        
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Check if the feedback belongs to the user
        if (feedback.user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete the feedback
        await feedback.destroy();

        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuthenticated } = require('../middlewares/auth');
const { isVerifiedLawyer } = require('../middlewares/lawyerVerification');

// All routes require authentication
router.use(isAuthenticated);

// Lawyer calendar management routes
router.get('/calendar', isVerifiedLawyer, appointmentController.getCalendar);
router.post('/availability', isVerifiedLawyer, appointmentController.updateAvailability);

// Get available slots for booking
router.get('/lawyer/:lawyerId/slots/:date', appointmentController.getAvailableSlots);

// Booking routes
router.get('/book/:lawyerId', appointmentController.getBookingPage);
router.post('/book', appointmentController.bookAppointment);

// General appointment management
router.get('/appointments', isAuthenticated, appointmentController.getAppointments);
router.get('/my-appointments', isAuthenticated, async (req, res) => {
    try {
        const { Appointment, User, Lawyer } = require('../models');
        
        // Get user's appointments (both as client and lawyer)
        const appointments = await Appointment.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { client_id: req.session.user_id },
                    { lawyer_id: req.session.user_id }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'Client',
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [{
                        model: require('../models').ProfileImage,
                        attributes: ['imagePath']
                    }]
                },
                {
                    model: User,
                    as: 'Lawyer',
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        {
                            model: Lawyer,
                            attributes: ['legalAreas', 'lawFirm', 'verificationStatus']
                        },
                        {
                            model: require('../models').ProfileImage,
                            attributes: ['imagePath']
                        }
                    ]
                }
            ],
            order: [['appointment_date', 'DESC'], ['start_time', 'DESC']]
        });
        
        res.render('appointments/my-appointments', {
            appointments: appointments,
            title: 'My Appointments'
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
        res.status(500).render('error', {
            error: 'Error loading appointments'
        });
    }
});
router.post('/:id/status', isAuthenticated, appointmentController.updateAppointmentStatus);
router.post('/:id/cancel', isAuthenticated, async (req, res) => {
    try {
        const { Appointment } = require('../models');
        const appointmentId = req.params.id;
        
        const appointment = await Appointment.findOne({
            where: {
                id: appointmentId,
                [require('sequelize').Op.or]: [
                    { clientId: req.session.user_id },
                    { lawyerId: req.session.user_id }
                ]
            }
        });
        
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }
        
        await appointment.update({ status: 'cancelled' });
        
        res.json({ success: true, message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ success: false, error: 'Error cancelling appointment' });
    }
});

// API routes for AJAX requests
router.get('/api/appointments', appointmentController.getAppointments);
router.get('/api/lawyer/:lawyerId/availability', async (req, res) => {
    try {
        const { Availability } = require('../models');
        const availability = await Availability.findAll({
            where: { lawyer_id: req.params.lawyerId, is_available: true },
            order: [['day_of_week', 'ASC']]
        });
        res.json({ success: true, availability });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get availability' });
    }
});

module.exports = router;
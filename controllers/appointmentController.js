const { User, Lawyer, Appointment, Availability, AvailabilityOverride } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../util/db');

// Get lawyer's calendar/availability page
exports.getCalendar = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findByPk(userId, {
            include: [{ model: Lawyer }]
        });

        if (!user || user.role !== 'lawyer') {
            return res.status(403).render('error', { error: 'Access denied. Only lawyers can manage calendars.' });
        }

        // Get lawyer's availability settings
        const availability = await Availability.findAll({
            where: { lawyer_id: userId },
            order: [['day_of_week', 'ASC']]
        });

        // Get upcoming appointments
        const appointments = await Appointment.findAll({
            where: {
                lawyer_id: userId,
                appointment_date: {
                    [Op.gte]: new Date()
                }
            },
            include: [{
                model: User,
                as: 'Client',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }],
            order: [['appointment_date', 'ASC'], ['start_time', 'ASC']]
        });

        res.render('appointments/calendar', {
            title: 'My Calendar | Legal Network',
            user: req.session.user,
            availability,
            appointments
        });
    } catch (error) {
        console.error('Error loading calendar:', error);
        res.status(500).render('error', { error: 'Failed to load calendar' });
    }
};

// Update lawyer's availability
exports.updateAvailability = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { availability } = req.body; // Array of availability objects

        // Verify user is a lawyer
        const user = await User.findByPk(userId, {
            include: [{ model: Lawyer }]
        });

        if (!user || user.role !== 'lawyer') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Delete existing availability
        await Availability.destroy({ where: { lawyer_id: userId } });

        // Create new availability records
        const availabilityRecords = availability.map(slot => ({
            lawyer_id: userId,
            day_of_week: slot.day,
            start_time: slot.startTime,
            end_time: slot.endTime,
            is_available: slot.isAvailable,
            consultation_duration: slot.duration || 60,
            break_between_appointments: slot.breakTime || 15
        }));

        await Availability.bulkCreate(availabilityRecords);

        res.json({ success: true, message: 'Availability updated successfully' });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ success: false, error: 'Failed to update availability' });
    }
};

// Get available time slots for a lawyer on a specific date
exports.getAvailableSlots = async (req, res) => {
    try {
        const { lawyerId, date } = req.params;
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

        // Get lawyer's general availability for this day
        const availability = await Availability.findOne({
            where: {
                lawyer_id: lawyerId,
                day_of_week: dayOfWeek,
                is_available: true
            }
        });

        if (!availability) {
            return res.json({ success: true, slots: [] });
        }

        // Check for date-specific overrides
        const override = await AvailabilityOverride.findOne({
            where: {
                lawyer_id: lawyerId,
                date: requestedDate.toISOString().split('T')[0]
            }
        });

        if (override && !override.is_available) {
            return res.json({ success: true, slots: [] });
        }

        // Get existing appointments for this date
        const existingAppointments = await Appointment.findAll({
            where: {
                lawyer_id: lawyerId,
                appointment_date: requestedDate.toISOString().split('T')[0],
                status: { [Op.in]: ['pending', 'confirmed'] }
            },
            order: [['start_time', 'ASC']]
        });

        // Generate available time slots
        const slots = generateTimeSlots(
            availability.start_time,
            availability.end_time,
            availability.consultation_duration,
            availability.break_between_appointments,
            existingAppointments
        );

        res.json({ success: true, slots });
    } catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({ success: false, error: 'Failed to get available slots' });
    }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
    try {
        const {
            lawyerId,
            appointmentDate,
            startTime,
            consultationType,
            meetingType,
            notes
        } = req.body;
        const clientId = req.session.user_id;

        // Verify the time slot is still available
        const existingAppointment = await Appointment.findOne({
            where: {
                lawyer_id: lawyerId,
                appointment_date: appointmentDate,
                start_time: startTime,
                status: { [Op.in]: ['pending', 'confirmed'] }
            }
        });

        if (existingAppointment) {
            return res.status(400).json({ success: false, error: 'Time slot is no longer available' });
        }

        // Get consultation duration from lawyer's availability
        const requestedDate = new Date(appointmentDate);
        const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
        
        const availability = await Availability.findOne({
            where: {
                lawyer_id: lawyerId,
                day_of_week: dayOfWeek
            }
        });

        const duration = availability ? availability.consultation_duration : 60;
        const endTime = addMinutesToTime(startTime, duration);

        // Create the appointment
        const appointment = await Appointment.create({
            lawyer_id: lawyerId,
            client_id: clientId,
            appointment_date: appointmentDate,
            start_time: startTime,
            end_time: endTime,
            duration,
            consultation_type: consultationType,
            meeting_type: meetingType,
            notes,
            client_notes: notes,
            status: 'pending'
        });

        // Get lawyer and client details for response
        const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
            include: [
                {
                    model: User,
                    as: 'Lawyer',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [{ model: Lawyer }]
                },
                {
                    model: User,
                    as: 'Client',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Appointment booked successfully',
            appointment: appointmentWithDetails
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ success: false, error: 'Failed to book appointment' });
    }
};

// Get appointments for a user (lawyer or client)
exports.getAppointments = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = req.session.user;
        const { status, type } = req.query;

        let whereClause = {};
        let includeClause = [];

        if (user.role === 'lawyer') {
            whereClause.lawyer_id = userId;
            includeClause.push({
                model: User,
                as: 'Client',
                attributes: ['id', 'firstName', 'lastName', 'email']
            });
        } else {
            whereClause.client_id = userId;
            includeClause.push({
                model: User,
                as: 'Lawyer',
                attributes: ['id', 'firstName', 'lastName', 'email'],
                include: [{ model: Lawyer }]
            });
        }

        if (status) {
            whereClause.status = status;
        }

        if (type === 'upcoming') {
            whereClause.appointment_date = {
                [Op.gte]: new Date()
            };
        } else if (type === 'past') {
            whereClause.appointment_date = {
                [Op.lt]: new Date()
            };
        }

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: includeClause,
            order: [['appointment_date', 'DESC'], ['start_time', 'DESC']]
        });

        res.render('appointments/list', {
            title: 'My Appointments | Legal Network',
            user: req.session.user,
            appointments,
            userRole: user.role
        });
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).render('error', { error: 'Failed to load appointments' });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, notes } = req.body;
        const userId = req.session.user_id;

        const appointment = await Appointment.findByPk(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        // Only lawyer or client can update their own appointments
        if (appointment.lawyer_id !== userId && appointment.client_id !== userId) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        await appointment.update({
            status,
            notes: notes || appointment.notes
        });

        res.json({ success: true, message: 'Appointment updated successfully' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ success: false, error: 'Failed to update appointment' });
    }
};

// Get booking page for clients
exports.getBookingPage = async (req, res) => {
    try {
        const { lawyerId } = req.params;
        
        const lawyer = await User.findByPk(lawyerId, {
            include: [{
                model: Lawyer,
                include: [{
                    model: LawyerFeedback,
                    include: [{
                        model: User,
                        attributes: ['firstName', 'lastName']
                    }]
                }]
            }],
            attributes: ['id', 'firstName', 'lastName', 'email']
        });

        if (!lawyer || !lawyer.Lawyer) {
            return res.status(404).render('error', { error: 'Lawyer not found' });
        }

        // Get lawyer's availability for the next 30 days
        const availability = await Availability.findAll({
            where: { lawyer_id: lawyerId, is_available: true },
            order: [['day_of_week', 'ASC']]
        });

        res.render('appointments/book', {
            title: `Book Consultation with ${lawyer.firstName} ${lawyer.lastName} | Legal Network`,
            user: req.session.user,
            lawyer,
            availability
        });
    } catch (error) {
        console.error('Error loading booking page:', error);
        res.status(500).render('error', { error: 'Failed to load booking page' });
    }
};

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, duration, breakTime, existingAppointments) {
    const slots = [];
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    
    for (let current = start; current + duration <= end; current += duration + breakTime) {
        const slotStart = minutesToTime(current);
        const slotEnd = minutesToTime(current + duration);
        
        // Check if this slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(appointment => {
            const appointmentStart = timeToMinutes(appointment.start_time);
            const appointmentEnd = timeToMinutes(appointment.end_time);
            return current < appointmentEnd && (current + duration) > appointmentStart;
        });
        
        if (!hasConflict) {
            slots.push({
                startTime: slotStart,
                endTime: slotEnd,
                available: true
            });
        }
    }
    
    return slots;
}

// Helper function to convert time string to minutes
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Helper function to convert minutes to time string
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper function to add minutes to time string
function addMinutesToTime(timeString, minutesToAdd) {
    const totalMinutes = timeToMinutes(timeString) + minutesToAdd;
    return minutesToTime(totalMinutes);
}
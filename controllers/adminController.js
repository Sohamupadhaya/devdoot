const adminService= require('../services/adminService');

const login = async (req, res) => {
    try {
        await adminService.login(req, res); 
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

const getEventBookings = async (req, res) => {
    try {
        const bookings = await adminService.getEventBookings(req, res);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    login,
    getEventBookings
}
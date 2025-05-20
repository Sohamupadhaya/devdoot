const eventService = require('../services/eventService')

const bookEvents= async (req, res)=>{
    try {
        eventService.bookEvents(req, res)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getUserEvents= async (req, res)=>{
    try {
        eventService.getUserEvents(req, res)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getOneEvent = async (req, res) => {
    try {
        eventService.getOneEvent(req, res)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

module.exports={
    bookEvents,
    getUserEvents,
    getOneEvent
}
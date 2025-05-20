const express = require('express')
const  BookedEvent= require("../models/bookedEvents");
const User = require("../models/user");
const { eventSchema, validateId } = require("../validator/eventValidator");

const bookEvents = async(req, res)=>{
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "User not found",
            });
        }
        let body = { ...req.body };
        if (typeof body.date === 'string') {
            body.date = new Date(body.date);
        }
        const data = eventSchema.safeParse(body);
        if (!data.success) {
            return res.status(400).json({
                error: "Validation error",
                message: data.error.errors,

            });
        }
        const bookedEvent = await BookedEvent.create({
            userId: userId,
            topic: data.data.topic,
            scheduledAt: data.data.date,
            description: data.data.description,
            location: data.data.location,
        });

        if(bookedEvent){
            return res.status(200).json({
                message: "event booked successfully",
                data: bookedEvent,
            });
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong, please try again later.",
          });
        
    }
}

const getUserEvents= async(req, res)=>{
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "User not found",
            });
        }
        const bookedEvent = await BookedEvent.findAll({
            where: {
                userId: userId
            }
        });

        if(bookedEvent){
            return res.status(200).json({
                message: "event fetched successfully",
                data: bookedEvent,
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong, please try again later.",
          });
    }

}

const getOneEvent = async(req, res) => {
    try {
        const userId = req.user.id;
        const eventId =  validateId.safeParse({ id: req.params.id });
        if (!eventId.success) {
            return res.status(400).json({
                error: "Validation error",
                message: eventId.error.errors,
            });
        }
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "User not found",
            });
        }
        const bookedEvent = await BookedEvent.findOne({
            where: {
                id: req.params.id,
                userId: userId
            }
        });
        if (!bookedEvent) {
            return res.status(404).json({
                error: "Event not found",
                message: "Event not found",
            });
        }
        return res.status(200).json({
            message: "Event found successfully",
            data: bookedEvent,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong, please try again later.",
          });
        
    }
}

module.exports = {
    bookEvents,
    getUserEvents,
    getOneEvent
}
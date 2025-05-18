const { z } = require("zod");

const eventSchema = z.object({
    topic: z.string().min(5, "Topic is required"),
    date : z.date().refine((date) => date > new Date(), {
        message: "Time must be in the future",
    }),
    description: z.string().min(10, "Description is required"),
    location: z.string(),
})

const validateId = z.object({
    id: z.string(),
});

module.exports = {
    eventSchema,
    validateId
};
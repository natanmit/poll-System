const router = require('express').Router();
const { createPollValidation } = require('../util/joiValidate');
const logger = require('../util/logger');
const verifyToken = require('../util/verifyToken');
const Poll = require('../models/Poll');

/**
 * @swagger
 * /api/polls/create:
 *   post:
 *     summary: Create a new poll
 *     description: Endpoint to create a new poll with an associated user and question.
 *     operationId: createPoll
 *     tags:
 *       - Poll
 *     requestBody:
 *       description: Data to create a new poll
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The ID of the question for the poll
 *               selectedAnswer:
 *                 type: string
 *                 description: The answer selected by the user
 *                 enum: ['', 'firstAnswer', 'secondAnswer', 'thirdAnswer', 'fourthAnswer']
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Poll data created successfully
 *       '400':
 *         description: Bad request when data validation fails
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       '500':
 *         description: Internal server error while creating poll
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       required:
 *         - user
 *         - question
 *         - selectedAnswer
 *       properties:
 *         question:
 *           type: string
 *           description: The ID of the question associated with the poll
 *         selectedAnswer:
 *           type: string
 *           description: The answer selected by the user
 *           enum: ['', 'firstAnswer', 'secondAnswer', 'thirdAnswer', 'fourthAnswer']
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of poll creation
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last poll update
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         message:
 *           type: string
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */
router.post('/create', verifyToken, async (req, res) => {
    const { error } = createPollValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const pollExists = await Poll.findOne({ user: req.user._id, question: req.body.question });
        if (pollExists) {
            if (pollExists.selectedAnswer === '' && req.body.selectedAnswer) {
                pollExists.selectedAnswer = req.body.selectedAnswer;
                await pollExists.save(); // Make sure to wait for the save operation to complete
                return res.status(200).json({ message: 'Poll answer updated successfully' });
            }
            return res.status(400).json({ message: 'Poll already exists' }); 
        }

        const pollData = {
            user: req.user._id,
            question: req.body.question,
            selectedAnswer: req.body.selectedAnswer,
        };

        const poll = await Poll.create(pollData); // No need to wrap this in another try-catch since it's already within one.
        logger.info('The Poll data created successfully!');
        res.status(201).json({
            status: "success",
            message: "The Poll data created successfully!",
            poll: poll
        });
    } catch (error) {
        logger.error(`Error creating Poll: ${error.message}`);
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

module.exports = router;
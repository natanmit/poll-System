const router = require('express').Router();
const Question = require('../models/Question');
const Poll = require('../models/Poll');
const { createQuestionValidation, updateQuestionValidation } = require('../util/joiValidate');
const logger = require('../util/logger');
const verifyToken = require('../util/verifyToken');

/**
 * @openapi
 * /api/questions:
 *   get:
 *     summary: Retrieve paginated questions
 *     description: Fetch a list of questions with pagination provided by authenticated users.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Question
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Limit for the number of questions per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of questions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCount:
 *                   type: integer
 *                   example: 50
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *                 filteredCount:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Internal server error or exception while fetching questions.
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       # Add more properties as needed for your Question schema
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1;
    const skip = (page - 1) * limit;

    try {
        const totalCount = await Question.countDocuments({});
        const questions = await Question.find().skip(skip).limit(limit).select("-__v");
        
        logger.info(`Get Questions.`);
        return res.send({
            totalCount,
            questions,
            filteredCount: questions.length,
        });
    } catch (error) {
        logger.error(`Error getting Question: ${error.message}`);
        return res.status(500).send({ status: "error", message: error.message });
    }
});

/**
 * @openapi
 * /api/questions/create:
 *   post:
 *     summary: Create a new question
 *     description: Endpoint for creating a new question provided by an authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - firstAnswer
 *               - secondAnswer
 *               - thirdAnswer
 *               - fourthAnswer
 *             properties:
 *               title:
 *                 type: string
 *               firstAnswer:
 *                 type: string
 *               secondAnswer:
 *                 type: string
 *               thirdAnswer:
 *                 type: string
 *               fourthAnswer:
 *                 type: string
 *     responses:
 *       200:
 *         description: The Question data created successfully.
 *       400:
 *         description: Validation error with input data.
 *       500:
 *         description: Internal server error or exception while creating question.
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         firstAnswer:
 *           type: string
 *         secondAnswer:
 *           type: string
 *         thirdAnswer:
 *           type: string
 *         fourthAnswer:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post('/create', verifyToken, async (req, res) => {
    const { error } = createQuestionValidation(req.body);
    if (error) { return res.status(400).send(error.details[0].message); }
    const questionData = {
        title: req.body.title,
        firstAnswer: req.body.firstAnswer,
        secondAnswer: req.body.secondAnswer,
        thirdAnswer: req.body.thirdAnswer,
        fourthAnswer: req.body.fourthAnswer,
    }
    
    try {
        const question = await Question.create(questionData);
        logger.info(`The Question data created successfully!.`);
        return res.status(200).send({ status: "success", message: "The Question data created successfully!", question: question });
    } catch (error) {
        logger.error(`Error creating Question: ${error.message}`);
        return res.status(500).send({ status: "error", message: error.message });
    }
});

/**
 * @openapi
 * /api/questions/update/{id}:
 *   post:
 *     summary: Update an existing question
 *     description: Endpoint for updating an existing question by its ID provided by an authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Question
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the question to be updated.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               firstAnswer:
 *                 type: string
 *               secondAnswer:
 *                 type: string
 *               thirdAnswer:
 *                 type: string
 *               fourthAnswer:
 *                 type: string
 *     responses:
 *       200:
 *         description: The Question data updated successfully.
 *       400:
 *         description: Validation error with input data.
 *       500:
 *         description: Internal server error or exception while updating question.
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         firstAnswer:
 *           type: string
 *         secondAnswer:
 *           type: string
 *         thirdAnswer:
 *           type: string
 *         fourthAnswer:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put('/update/:id', verifyToken, async (req, res) => {

    const { error } = updateQuestionValidation(req.body);
    if (error) { return res.status(400).send(error.details[0].message); }
    const updateValues = req.body;
    
    try {
        const updatedQuestion = await Question.findOneAndUpdate({ _id: req.params.id }, updateValues, {
            new: true,
            runValidators: true,
        }).select('-__v');
        logger.info(`The Question data updated successfully!.`);
        return res.status(200).send({ status: "success", message: "The Question data updated successfully!", updatedQuestion: updatedQuestion });
    } catch (error) {
        logger.error(`Error update Question: ${error.message}`);
        return res.status(500).send({ status: "error", message: error.message });
    }
});

/**
 * @openapi
 * /api/questions/delete/{id}:
 *   delete:
 *     summary: Delete a question
 *     description: Delete a question from the database by its ID, provided by authenticated users.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Question
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the question.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question successfully deleted!
 *       404:
 *         description: Question not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found.
 *       500:
 *         description: Internal server error or exception while deleting the question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error message describing the specific server error.
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        // Attempt to delete the question with the provided ID.
        const deletionResult = await Question.deleteOne({ _id: req.params.id });
        await Poll.deleteMany({ question: req.params.id });
        // Check if the question was actually found and deleted
        if (deletionResult.deletedCount === 0) {
            logger.error(`Question not found`);
            res.status(404).send({ message: 'Question not found.' });
        } else {
            logger.info(`Question successfully deleted!`);
            res.json({ message: 'Question successfully deleted!' });
        }
    } catch (error) {
        // In case of any errors during the database operation, send a server error response.
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
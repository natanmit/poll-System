const Question = require('../models/Question');
const Poll = require('../models/Poll');
const logger = require('../util/logger');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = require('express').Router();

/**
 * @openapi
 * /api/statistics/question/{questionId}:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Retrieves question details along with answer counts.
 *     description: Returns the details of a specific question and aggregated counts of each selected answer.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: Unique ID of the question.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A question object along with answer counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     firstAnswer:
 *                       type: string
 *                     secondAnswer:
 *                       type: string
 *                     thirdAnswer:
 *                       type: string
 *                     fourthAnswer:
 *                       type: string
 *                 answeredUserCounts:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *       '404':
 *         description: Question not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/question/:questionId', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        // Aggregate counts of each selected answer for a specific question
        const answerCounts = await Poll.aggregate([
            { $match: { question: new mongoose.Types.ObjectId(questionId) } }, // Filter by question ID
            {
                $group: {
                    _id: '$selectedAnswer',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    selectedAnswer: '$_id',
                    count: 1
                }
            }
        ]);

        // Retrieve question details
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).send({ message: "Question not found" });
        }

        // Respond with both question details and answer counts
        return res.send({
            question: {
                id: question._id,
                title: question.title,
                firstAnswer: question.firstAnswer,
                secondAnswer: question.secondAnswer,
                thirdAnswer: question.thirdAnswer,
                fourthAnswer: question.fourthAnswer
            },
            answeredUserCounts: answerCounts.reduce((acc, answerCountObj) => {
                acc[answerCountObj.selectedAnswer] = answerCountObj.count;
                return acc;
            }, {})
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @openapi
 * /api/statistics/question-total/{questionId}:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Retrieves the total number of answers for a specific question.
 *     description: Returns the details of a specific question along with the total number of user answers for each answer option.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: Unique ID of the question.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A question object along with the total number of user answers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     firstAnswer:
 *                       type: string
 *                     secondAnswer:
 *                       type: string
 *                     thirdAnswer:
 *                       type: string
 *                     fourthAnswer:
 *                       type: string
 *                 totalNumberOfAnswers:
 *                   type: integer
 *                   description: The total count of answers received for the question.
 *       '404':
 *         description: Question not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/question-total/:questionId', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        // Aggregate counts of each selected answer for a specific question
        const answerCounts = await Poll.aggregate([
            { $match: { question: new mongoose.Types.ObjectId(questionId) } }, // Filter by question ID
            {
                $group: {
                    _id: '$selectedAnswer',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    selectedAnswer: '$_id',
                    count: 1
                }
            }
        ]);

        // Retrieve question details
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).send({ message: "Question not found" });
        }

        // Calculate the total number of answers
        const totalNumberOfAnswers = answerCounts.reduce((total, answerCountObj) => {
            return total + answerCountObj.count;
        }, 0);

        // Respond with both question details and total number of user answers
        res.send({
            question: {
                id: question._id.toString(),
                title: question.title,
                firstAnswer: question.firstAnswer,
                secondAnswer: question.secondAnswer,
                thirdAnswer: question.thirdAnswer,
                fourthAnswer: question.fourthAnswer
            },
            totalNumberOfAnswers: totalNumberOfAnswers
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @openapi
 * /api/statistics/user/{userId}/answers:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Retrieves answers submitted by a specific user.
 *     description: Returns the username along with a detailed list of answers that the user has submitted for different questions.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Unique ID of the user.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: An object containing the user's name and their answers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userName:
 *                   type: string
 *                   description: Full name of the user.
 *                 answers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionTitle:
 *                         type: string
 *                       userAnswer:
 *                         type: string
 *       '404':
 *         description: User not found or no answers submitted by this user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/user/:userId/answers', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Retrieve a list of answers submitted by the user
        const userAnswers = await Poll.find({ user: new mongoose.Types.ObjectId(userId) })
            .populate('question')
            .exec();

        // Retrieve the username from the User collection
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (!userAnswers.length) {
            return res.status(404).send({ message: "No answers submitted by this user." });
        }

        // Transform the userAnswers to include necessary details
        const answersDetail = userAnswers.map(answer => ({
            questionTitle: answer.question.title,
            userAnswer: answer.selectedAnswer,
        }));

        // Respond with the username and the detailed answers
        return res.send({
            userName: user.firstname + ' ' + user.lastname,
            answers: answersDetail
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/**
 * @openapi
 * /api/statistics/questions/summary:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Retrieves a summary of all questions with answer counts.
 *     description: >
 *       Returns a list of questions along with the total count for each answer option,
 *       including the text of each option that users have selected.
 *     responses:
 *       '200':
 *         description: A list of question summaries including answer option text and counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: The title of the question.
 *                   options:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         firstAnswer:
 *                           type: string
 *                         secondAnswer:
 *                           type: string
 *                         thirdAnswer:
 *                           type: string
 *                         fourthAnswer:
 *                           type: string
 *                         count:
 *                           type: integer
 *                           description: The total count for the given answer option.
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/questions/summary', async (req, res) => {
    try {
        // Retrieve all questions and include the count and text of each answer option selected by users
        const questionsSummary = await Question.aggregate([
            {
                $lookup: {
                    from: "polls", // Replace with your Poll collection name
                    localField: "_id",
                    foreignField: "question",
                    as: "userAnswers"
                }
            },
            {
                $project: {
                    title: 1,
                    firstAnswerText: "$firstAnswer", // Include the text value for firstAnswer
                    secondAnswerText: "$secondAnswer", // Include the text value for secondAnswer
                    thirdAnswerText: "$thirdAnswer", // Include the text value for thirdAnswer
                    fourthAnswerText: "$fourthAnswer", // Include the text value for fourthAnswer
                    firstAnswerCount: {
                        $size: {
                            $filter: {
                                input: "$userAnswers",
                                as: "answer",
                                cond: { $eq: ["$$answer.selectedAnswer", "firstAnswer"] }
                            }
                        }
                    },
                    secondAnswerCount: {
                        $size: {
                            $filter: {
                                input: "$userAnswers",
                                as: "answer",
                                cond: { $eq: ["$$answer.selectedAnswer", "secondAnswer"] }
                            }
                        }
                    },
                    thirdAnswerCount: {
                        $size: {
                            $filter: {
                                input: "$userAnswers",
                                as: "answer",
                                cond: { $eq: ["$$answer.selectedAnswer", "thirdAnswer"] }
                            }
                        }
                    },
                    fourthAnswerCount: {
                        $size: {
                            $filter: {
                                input: "$userAnswers",
                                as: "answer",
                                cond: { $eq: ["$$answer.selectedAnswer", "fourthAnswer"] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    options: [
                        { firstAnswer: "$firstAnswerText", count: "$firstAnswerCount" },
                        { secondAnswer: "$secondAnswerText", count: "$secondAnswerCount" },
                        { thirdAnswer: "$thirdAnswerText", count: "$thirdAnswerCount" },
                        { fourthAnswer: "$fourthAnswerText", count: "$fourthAnswerCount" }
                    ]
                }
            }
        ]);

        // Respond with the questions summary
        res.send(questionsSummary);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


module.exports = router;
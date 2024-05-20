const router = require('express').Router();
const User = require("../models/User");
const Poll = require("../models/Poll");
const { createUserValidation, updateUserValidation } = require('../util/joiValidate');
const logger = require('../util/logger');
const verifyToken = require('../util/verifyToken');
const bcrypt = require('bcrypt');
const saltLength = 10;

/**
 * @openapi
 * /api/users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Returns a list of users
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: A list of users.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const searchQuery = typeof req.query.q !== 'undefined' ? req.query.q : '';
        const filterParams = {
            $and: [
                {
                    $or: [
                        { firstname: { $regex: searchQuery, $options: 'i' } },
                        { lastname: { $regex: searchQuery, $options: 'i' } },
                        { email: { $regex: searchQuery, $options: 'i' } },
                    ],
                },
            ],
        };
        const totalCount = await User.countDocuments({});
        const users = await User.find(filterParams).select('-password -__v');
        logger.info(`Get all Users`);
        return res.send({
            totalCount,
            users,
            filteredCount: users.length,
        })
    } catch (error) {
        logger.error(`Error getting all users: ${error.message}`);
        return res.status(500).send(`An error occurred: ${error.message}`);
    }
});

/**
 * @openapi
 * /api/users/personal/me:
 *   get:
 *     summary: Get the personal information of the logged-in user
 *     description: Retrieve personal information for the current authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 birthday:
 *                   type: string
 *                   format: date
 *                 address:
 *                   type: string
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/personal/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -__v');
        logger.info(`Get My Information`);
        return res.send(user);
    } catch (error) {
        logger.error(`Error Getting Information: ${error.message}`);
        return res.status(500).send({ message: error.message });
    }
});


/**
 * @openapi
 * /api/users/logout:
 *   get:
 *     summary: Log out the current user
 *     description: Clear cookies to log the user out of the application.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'successfully logout'
 *       500:
 *         description: Internal server error
 */
router.get('/logout', async (req, res) => {
    try {
        res.cookie('refreshToken', '', { maxAge: 1 });
        return res.status(200).send({ message: 'successfully logout' });
    } catch (error) {
        return res.status(500).send({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user account with the provided information.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - password
 *               - birthday
 *               - address
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword123
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               address:
 *                 type: string
 *                 example: "123 Main Street, Anytown, USA"
 *     responses:
 *       200:
 *         description: User successfully registered with access token returned.
 *       400:
 *         description: Bad request due to validation error or duplicate email
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - email
 *         - password
 *         - birthday
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *           example: 60d0fe4f5311236168a109ca
 *         firstname:
 *           type: string
 *           example: John
 *         lastname:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         birthday:
 *           type: string
 *           format: date
 *           example: 1990-01-01
 *         address:
 *           type: string
 *           example: "123 Main Street, Anytown, USA"
 */
router.post('/create', verifyToken, async (req, res) => {
    // validate request
    const { error } = createUserValidation(req.body);

    if (error) return res.status(400).send(error.details[0].message);
    // check for unique user
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) { return res.status(400).send({ message: 'Email already exists' }); }

    // hash the password
    const salt = await bcrypt.genSalt(saltLength);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashPassword,
        birthday: req.body.birthday,
        address: req.body.address,
    });

    try {
        const savedUser = await user.save();

        // remove password
        delete savedUser._doc.password;
        logger.info(`The User data created successfully.`);
        return res.send({ user: savedUser, message: 'User successfully created' });
    } catch (err) {
        logger.error(`Error creating user: ${error.message}`);
        return res.status(500).send(err);
    }
});

/**
 * @swagger
 * /api/users/update/{id}:
 *   put:
 *     summary: Update an existing user
 *     description: Updates a user's details by their ID. Passwords are rehashed before saving.
 *     operationId: updateUser
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID to update
 *     requestBody:
 *       description: Data for updating the existing user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                  type: string
 *                  format: email
 *               password:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User data updated successfully
 *       '400':
 *         description: Bad request when data validation fails
 *       '500':
 *         description: Internal server error while updating user
 */
router.put('/update/:id', verifyToken, async (req, res) => {

    const { error } = updateUserValidation(req.body);
    if (error) { return res.status(400).send(error.details[0].message); }
    // hash the password
    const salt = await bcrypt.genSalt(saltLength);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    let updateValues = req.body;
    updateValues.password = hashPassword;
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: req.params.id }, updateValues, {
            new: true,
            runValidators: true,
        }).select('-__v');
        logger.info(`The User data updated successfully.`);
        return res.status(200).send({ status: "success", message: "The User data updated successfully!", updatedUser: updatedUser });
    } catch (error) {
        logger.error(`Error updateding user: ${error.message}`);
        return res.status(500).send({ status: "error", message: error.message });
    }
});

/**
 * @openapi
 * /api/users/delete/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by ID. Only accessible by users with 'admin' role.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the user to be deleted.
 *     responses:
 *       200:
 *         description: User successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User successfully deleted!
 *       401:
 *         description: Unauthorized access, invalid or missing token.
 *       403:
 *         description: Forbidden action, user does not have necessary permissions.
 *       404:
 *         description: User not found with the given ID.
 *       500:
 *         description: Server error occurred while deleting the user.
 */

router.delete('/delete/:id', verifyToken, async (req, res) => {
    await User.deleteOne({ _id: req.params.id });
    await Poll.deleteMany({ user: req.params.id });
    logger.info(`User with id ${req.params.id} successfully deleted.`);
    return res.send({ message: 'User successfully deleted!' });
});


module.exports = router;
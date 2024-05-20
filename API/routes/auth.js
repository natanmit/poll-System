const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { registerValidation, loginValidation } = require('../util/joiValidate');
const User = require('../models/User');
const logger = require('../util/logger');

const saltLength = 10;
const authConfig = {
    expireTime: '1d',
    refreshTokenExpireTime: '1d',
};

// Endpoint: Login user
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in an user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User successfully logged in with access token returned.
 *       400:
 *         description: Login error
 */
router.post('/login', async (req, res) => {
    // validate request
    const { error } = loginValidation(req.body);
    if (error) { return res.status(400).send(error.details[0].message); }

    const user = await User.findOneAndUpdate({ email: req.body.email }, { lastLogin: new Date() }).select('-__v');
    if (!user) { 
        logger.info(`Email provided is not a registered account.`);
        return res.status(400).send({ message: 'Email provided is not a registered account' }); 
    }
    const tokenExpiry = req.body.remember ? '30d' : authConfig.expireTime;
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({ message: 'Username or password not found!' });

    // validation passed, create tokens
    const accessToken = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: tokenExpiry });

    // remove password
    delete user._doc.password;

    const userData = user;
    const response = {
        userData,
        accessToken,
        status: 'success'
    };

    return res.send(response);
});

// Endpoint: Register Users
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with the provided information.
 *     tags:
 *       - Auth
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
router.post('/register', async (req, res) => {
    // validate request
    const { error } = registerValidation(req.body);

    if (error) return res.status(400).send(error.details[0].message);
    // check for unique user
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) { 
        logger.info(`Email already exists.`);
        return res.status(400).send({ message: 'Email already exists.' }); 
    }

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

    // create an access token
    const accessToken = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: authConfig.expireTime });

    try {
        const savedUser = await user.save();

        // remove password
        delete savedUser._doc.password;
        logger.info(`User successfully registered.`);
        return res.send({ user: savedUser, accessToken, message: 'User successfully registered' });
    } catch (err) {
        logger.error(`Error registering user: ${error.message}`);
        return res.status(400).send(err);
    }
});

module.exports = router;
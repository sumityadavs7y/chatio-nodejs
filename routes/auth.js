const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/auth');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup', [
    body('email').isEmail().normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').isLength({ min: 5 })
],
    authController.signup);

router.post('/login', [
    body('email').isEmail().normalizeEmail()
], authController.login);

router.post('/check', isAuth, authController.check);

module.exports = router;
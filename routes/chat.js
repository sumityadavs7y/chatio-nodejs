const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/auth');
const chatController = require('../controllers/chat');

const router = express.Router();

router.post('/contact', isAuth, [
    body('email').isEmail().normalizeEmail()
], chatController.postContact);

router.get('/contacts', isAuth, chatController.getContacts);

router.post('/message', isAuth, [
    body('message').isLength({ min: 1 }),
    body('contact').isEmail().normalizeEmail()
], chatController.postMessage);

router.get('/messages/:contactId', isAuth, chatController.getMessages);

module.exports = router;
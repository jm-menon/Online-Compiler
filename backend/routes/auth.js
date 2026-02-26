const express = require('express');
const router = express.Router();

const register= require('../controllers/userAuthController');

router.post('/register', register.registerUser);
router.post('/login', register.loginUser)

module.exports= router;

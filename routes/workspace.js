const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User, WorkSpace } = require('../models');

const router = express.Router();


// workspace 생성
router.post('/', isLoggedIn, async (req, res, next) => {
    try{
        const workspace = await WorkSpace.create({
            hostId: req.user.id,
        });
        res.redirect('/');
    } catch(error){
        console.error(error);
        next(error);
    }
});

module.exports = router;
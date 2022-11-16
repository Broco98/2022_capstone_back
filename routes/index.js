const express = require('express');
const { User, WorkSpace } = require('../models');


const router = express.Router();

// 공통사항
router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
})

// 회원가입
router.get('/join', (req, res, next) => {
    res.render('join', { title: '회원가입' });
})

// 메인페이지 - 기본페이지
router.get('/', (req, res, next) => {
    res.render('main', { title: 'Capstone' });
})

module.exports = router;
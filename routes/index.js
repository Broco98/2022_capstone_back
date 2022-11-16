const express = require('express');
const { User, WorkSpace } = require('../models');


const router = express.Router();

// 공통사항
router.use((req, res, next) => {
    res.locals.user = req.user ? req.user : 0;
})

// 회원가입
router.get('/signup', (req, res, next) => {
    res.render('signup', { title: '회원가입' });
})

// 메인페이지 - 기본페이지
router.get('/', (req, res) => {
    res.send('hello');
})

module.exports = router;
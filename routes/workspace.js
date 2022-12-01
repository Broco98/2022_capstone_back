const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User, WorkSpace } = require('../models');
const db = require('../models/index');

const router = express.Router();
const WorkSpaceGroup = db.sequelize.models.WorkSpaceGroup;

// workspace 생성
router.post('/new', isLoggedIn, async (req, res, next) => {
    try{
        const newWorkSpace = await WorkSpace.create({
            userId: req.user.id,
            status: 'host',
        });
        // workspace_group도 같이생성
        await WorkSpaceGroup.create({
            hostWorkSpaceId: newWorkSpace.id,
            subWorkSpaceId: newWorkSpace.id,
            hostUserId: req.user.id,
            subUserId: req.user.id,
        });
        res.redirect('/');
    } catch(error){
        console.error(error);
        next(error);
    }
});

// workspace 입장, 호스트의 워크스페이스만 입장 가능
router.get('/:hostWorkSpaceId', isLoggedIn, async(req, res, next) => {
    try{
        // 입장하려는 호스트의 워크스페이스가 존재하는지 탐색
        const exHostWorkSpace = await WorkSpace.findOne({
            where: {
                id: req.params.hostWorkSpaceId,
                status: 'host',
            }
        });
        if(!exHostWorkSpace){
            return res.status(404).send('존재하지 않는 workspace');
        }

        // 자신이 호스트의 워크스페이스와 연결돼있는지 확인
        const exWorkSpace = await WorkSpaceGroup.findOne({
            where : {
                hostWorkSpaceId: req.params.hostWorkSpaceId,
                subUserId: req.user.id,
            },
        });

        // 자신이 호스트의 워크스페이스와 연결이 안돼있는 경우
        if(!exWorkSpace) {
            // subworkspace 생성
            const newSubWorkSpace = await WorkSpace.create({
                userId: req.user.id,
                status: 'sub',
            });
            // 호스트의 워크스페이스와 자신의 서브 워크스페이스를 연결
            await WorkSpaceGroup.create({
                hostWorkSpaceId: req.params.hostWorkSpaceId,
                subWorkSpaceId: newSubWorkSpace.id,
                hostUserId: exHostWorkSpace.userId,
                subUserId: req.user.id,
            });
        }
        const workSpaceGroups = await WorkSpaceGroup.findAll({
            where: {
                hostWorkSpaceId: req.params.hostWorkSpaceId,
            }
        })
        req.session.subWorkSpaceId = exWorkSpace.subWorkSpaceId; // 자신의 워크스페이스를 세션에 저장
        req.session.save();
        console.log(req.session.subWorkSpaceId);
        res.render('workspace', {workSpaceGroups});
    } catch(error){
        console.error(error);
        next(error);
    }
});

module.exports = router;
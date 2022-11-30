const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User, WorkSpace } = require('../models');
const db = require('../models/index');

const router = express.Router();
const WorkSpaceGroup = db.sequelize.models.WorkSpaceGroup;

// workspace 생성, 이벤트도 같이 생성해야함!
router.post('/new', isLoggedIn, async (req, res, next) => {
    try{
        const newWorkSpace = await WorkSpace.create({
            hostId: req.user.id,
        });
        // workspace_group도 같이생성
        await WorkSpaceGroup.create({
            hostWorkSpaceId: newWorkSpace.id,
            subWorkSpaceId: newWorkSpace.id,
            userId: req.user.id,
        });
        res.redirect('/');
    } catch(error){
        console.error(error);
        next(error);
    }
});

// workspace 입장
router.get('/:host_workspace_id', isLoggedIn, async(req, res, next) => {
    try{
        // 입장하려는 host workspace가 존재하는지 탐색
        const exHostWorkSpace = await WorkSpace.findOne({ where: {id: req.params.host_workspace_id} });
        if(!exHostWorkSpace){
            return res.status(404).send('존재하지 않는 workspace');
        }
        // 이미 연결된 workspace 탐색
        const exWorkSpace = await WorkSpaceGroup.findOne({
            where : {
                hostWorkSpaceId: req.params.host_workspace_id,
                userId: req.user.id,
            },
        });
        // 나와 연결된 workspace가 없으면
        if(!exWorkSpace){
            // subworkspace 생성
            const newWorkSpace = await WorkSpace.create({
                hostId: req.user.id
            });
            // 새로운 workspace 연결
            await WorkSpaceGroup.create({
                hostWorkSpaceId: req.params.host_workspace_id,
                subWorkSpaceId: newWorkSpace.id,
                userId: req.user.id,
            });
            // 자기 자신과 연결
            await WorkSpaceGroup.create({
                hostWorkSpaceId: newWorkSpace.id,
                subWorkSpaceId: newWorkSpace.id,
                userId: req.user.id,
            });
            // !!! 바뀔 수 있음!
            //const exHostWorkSpace = await WorkSpace.findOne({ where: {id: req.params.host_workspace_id} });
            // host와 자기자신 연결
            await WorkSpaceGroup.create({
                hostWorkSpaceId: newWorkSpace.id,
                subWorkSpaceId: req.params.host_workspace_id,
                userId: exHostWorkSpace.hostId,
            });
        }
        // host와 연결된 workspace들 반환
        const workSpaceGroups = await WorkSpaceGroup.findAll({
            where: {
                hostWorkSpaceId: req.params.host_workspace_id,
            }
        })
        res.render('workspace', { workspacegroups: workSpaceGroups } );
    } catch(error){
        console.error(error);
        next(error);
    }
});

module.exports = router;
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]; // env 정보 가져오기
const User = require('./user');
const WorkSpace = require('./workspace');
const WorkSpaceGroup = require('./workspacegroup');
//const Event = require('./event');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;

// 모델생성
// 일단 event 사용 X
db.User = User;
db.WorkSpace = WorkSpace;
db.WorkSpaceGroup = WorkSpaceGroup;
//db.Event = Event;

User.init(sequelize);
WorkSpace.init(sequelize);
WorkSpaceGroup.init(sequelize);
//Event.init(sequelize);

User.associate(db);
WorkSpace.associate(db);
WorkSpaceGroup.associate(db);
//Event.associate(db);

module.exports = db;
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]; // env 정보 가져오기
const User = require('./user');
const WorkSpace = require('./workspace');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
// 모델생성
db.User = User;
db.WorkSpace = WorkSpace;

User.init(sequelize);
WorkSpace.init(sequelize);

User.associate(db);
WorkSpace.associate(db);

module.exports = db;
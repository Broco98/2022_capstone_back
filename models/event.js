const Sequelize = require('sequelize');

module.exports = class Event extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            workSpaceId: {
                type: Sequelize.INTEGER,
            },
            entryNumber: {
                type: Sequelize.INTEGER,
            },
            events: {
                type: Sequelize.BLOB,
            },
        },
        {
            sequelize,
            timestamps: true, // 생성일, 수정일 자동생성
            underscored: false, // 생성일, 수정일 카멜케이스
            modelName: 'Event', // js
            tableName: 'events', // db 테이블 이름
            paranoid: true, // 삭제한 척 하는것 -> 삭제일 자동생성
            charset: 'utf8', // 한글 입력을 위해서!
            collate: 'utf8_general_ci',
        });
    }
    static associate(db){
    }
}
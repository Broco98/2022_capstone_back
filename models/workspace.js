// WorkSpace sequelize 모델 -> db의 테이블 즉, 테이블 그 자체라고 생각. 데이터가 담겨있음
const Sequelize = require('sequelize');

module.exports = class WorkSpace extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            },
            {
                sequelize,
                timestamps: true, // 생성일, 수정일 자동생성
                underscored: false, // 생성일, 수정일 카멜케이스
                modelName: 'WorkSpace', // js
                tableName: 'workspaces', // db 테이블 이름
                paranoid: true, // 삭제한 척 하는것 -> 삭제일 자동생성
                charset: 'utf8', // 한글 입력을 위해서!
                collate: 'utf8_general_ci',
            });
    }
    static associate(db){
        db.WorkSpace.belongsTo(db.User,{
            foreignKey: 'hostId',
            targetKey: 'id',
        }); // User에 1:N관계
        db.WorkSpace.belongsToMany(db.WorkSpace, {
            foreignKey: 'hostWorkSpaceId', // 외래키 이름
            as: 'SubWorkSpaceId', // followingId랑 반대로 적어야함 ex, 연예인의 팔로워를 가져오려면, followingId를 알아야함.
            through: 'WorkSpaceGroup',
        });
        db.WorkSpace.belongsToMany(db.WorkSpace, {
            foreignKey: 'subWorkSpaceId',
            as: 'HostWorkSpaceId', // 내가 팔로윙한 사람을 가져오려면, 내 id, 즉 followerId가 필요
            through: 'WorkSpaceGroup',
        });
    }
}

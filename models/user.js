// User sequelize 모델 -> db의 테이블 즉, 테이블 그 자체라고 생각. 데이터가 담겨있음
const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
                // id PK생략
                email: {
                    type: Sequelize.STRING(40),
                    allowNull: false,
                    unique: true,
                },
                nick: {
                    type: Sequelize.STRING(15),
                    allowNull: false,
                },
                password: {
                    type: Sequelize.STRING(100), //hash화 되면 길이가 늘어나니까 넉넉하게
                    allowNull: false, // SNS로 로그인하면 없을 수 있다.
                },
            },
            {
                sequelize,
                timestamps: true, // 생성일, 수정일 자동생성
                underscored: false, // 생성일, 수정일 카멜케이스
                modelName: 'User', // js
                tableName: 'users', // db 테이블 이름
                paranoid: true, // 삭제한 척 하는것 -> 삭제일 자동생성
                charset: 'utf8', // 한글 입력을 위해서!
                collate: 'utf8_general_ci',
            });
    }
    static associate(db){
        db.User.hasMany(db.WorkSpace, {
            foreignKey: 'hostId',
            sourceKey: 'id',
        }); // 1:N관계, 한명의 유저는 여러개의 WS를 갖는다.
    }
}

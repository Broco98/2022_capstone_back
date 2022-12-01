const SocketIO = require('socket.io');
const cookieParser = require('cookie-parser');

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);

    const workspace = io.of('/workspace');

    // session 연결
    io.use((socket, next) => {
        cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res || {}, next); // 미들웨어 확장패턴
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    })

    workspace.on('connection', (socket) => {
        console.log('workspace 접속완료');
        const req = socket.request;
        const { headers: {referer} } = req;
        const hostWorkSpaceId = referer
            .split('/')[referer.split('/').length-1]
            .replace(/?.+/, '');
        socket.join(hostWorkSpaceId);

        socket.on('disconnect', () => {
            console.log(hostWorkSpaceId, req.user.id, '접속해제');
            socket.leave(hostWorkSpaceId);
        });
    });
};
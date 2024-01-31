const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let players = {};

io.on('connection', (socket) => {
    socket.on('joinGame', (playerName) => {
        players[socket.id] = playerName;
        io.emit('updatePlayers', Object.values(players));
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', Object.values(players));
    });

    socket.on('selectFruit', (fruit) => {
        const fruits = ['bau', 'cua', 'tom', 'ca', 'ga', 'nai'];
        const randomIndex = Math.floor(Math.random() * fruits.length);
        const randomFruit = fruits[randomIndex];

        io.emit('updateResult', { player: players[socket.id], result: randomFruit });

        if (fruit === randomFruit) {
            io.to(socket.id).emit('showMessage', 'Chúc mừng! Bạn đã đoán đúng.');
        } else {
            io.to(socket.id).emit('showMessage', 'Rất tiếc! Bạn đã đoán sai.');
        }
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
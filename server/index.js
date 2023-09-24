const express = require("express");
const http = require('http');
const socketIo = require("socket.io");

const PORT = 80;
const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    },
});

// Define the activeUsers object to store connected users
const activeUsers = {};

// Log HTTP requests and responses
app.get("/", (req, res) => {
    res.send("<h1>server running</h1>");
    res.end();
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (sender) => {
        socket.sender = sender;
        activeUsers[socket.id] = sender;
        console.log(`${sender} joined the chat`);
        io.emit('userList', Object.values(activeUsers));
    });

    socket.on('message', (data) => {
        const message = {
            sender: socket.sender,
            text: data.text,
        };

        console.log('Received message:', message);
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        if (socket.sender) {
            console.log(`${socket.sender} disconnected`);
            delete activeUsers[socket.id];
            io.emit('userList', Object.values(activeUsers));
        }
    });

    // Send the current list of active users when a new user connects
    socket.emit('userList', Object.values(activeUsers));
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

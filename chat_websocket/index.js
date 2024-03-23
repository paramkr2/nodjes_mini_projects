const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app); // Create HTTP server using Express
const io = socketIo(server); // Attach Socket.IO to HTTP server

// Your Express routes and middleware can be defined here
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/room',(req,res)=>{
	res.sendFile(__dirname+'/room.html')
})

const users = new Map();

// Handle WebSocket connections with Socket.IO
io.on('connection', (socket) => {
    console.log(`User connected with socketid${socket.id}`);
    // Handle setting username
    socket.on('set username', (username,callback) => {
        users.set(socket.id, { username });
        console.log(`User ${username} connected with socket:${socket.id}`);
		callback({ success: true });
    });

    // Handle joining a room
    socket.on('join room', (roomName , callback) => {
        socket.join(roomName); 
        console.log(`User ${users.get(socket.id).username} joined room: ${roomName} socket:${socket.id}`);
		callback({ success: true });
    });

    // Handle leaving a room
    socket.on('leave room', (roomName ) => {
        socket.leave(roomName);
        console.log(`User ${users.get(socket.id).username} left room: ${roomName}`);
    });

    // Handle chat messages
    socket.on('chat message', (data) => {
        const { username } = users.get(socket.id);
        io.to(data.room).emit('chat message', { username, message: data.message });
    });

    // Handle disconnection
   socket.on('disconnect', () => {
    console.log(users);
    if (users.has(socket.id)) {
        const { username } = users.get(socket.id);
        console.log(`User ${username} disconnected`);
        users.delete(socket.id);
    } else {
        console.log(`User disconnected without setting a username`);
    }
});

});

// Start the HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
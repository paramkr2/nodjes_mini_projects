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

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle joining a room
    socket.on('join room', (roomName,callback) => {
        socket.join(roomName);
        console.log(`User joined room: ${roomName}`);
		callback({ success: true });
    });

    // Handle leaving a room
    socket.on('leave room', (roomName) => {
        socket.leave(roomName);
        console.log(`User left room: ${roomName}`);
    });

    // Handle chat messages
    socket.on('chat message', (data) => {
        // Broadcast the message to all clients in the same room
		console.log(data);
        io.to(data.room).emit('chat message', data.message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

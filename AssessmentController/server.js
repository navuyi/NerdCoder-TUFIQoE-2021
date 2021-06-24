const readline = require('readline');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 7070

server.listen(PORT, () => {
    console.log("[SERVER] Listening on port " + PORT);
});

io.on('connection', (socket) => {
    console.log('New connection with ID ' + socket.id);

    io.on('disconnect', ()=>{
        console.log("User disconnected");
    })
});

// Listen for key strokes
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
        process.exit();
    }
    else{
        if(key.name === "o"){
            console.log("Sending")
            create_assessment_panel()
        }
        else if(key.name === "p"){
            console.log("Sending")
            remove_assessment_panel()
        }
    }
});

const create_assessment_panel = () => {
    const data = {
        order: "create"
    }
    io.emit("controls", data)
}
const remove_assessment_panel = () => {
    const data = {
        order: "remove"
    }
    io.emit("controls", data)
}
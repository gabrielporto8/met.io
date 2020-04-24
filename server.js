const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/chat', (req, res) => {
    res.render('index.html');
});

let messages = [];
let usersOnline = [];

io.on('connection', socket => {
    socket.emit('previousMessages', messages);

    socket.on('userJoined', author => {

        var user = {
            id: socket.id,
            author: author
        };

        usersOnline.push(user);
        socket.emit('usersOnline', usersOnline);
        socket.broadcast.emit('userConnected', user);
    })
    
    socket.on('sendMessage', data => {
        messages.push(data);
        socket.broadcast.emit('receivedMessage', data);
    });

    socket.on('userTyping', data => {
        if(data.typing == true) {
            socket.broadcast.emit('renderUserTyping', data);
        } else {
            socket.broadcast.emit('renderUserTyping', data);
        }
    });

    socket.on('disconnect', () => {
        var index = usersOnline.map(function(e) { return e.id; }).indexOf(socket.id);
        var user = usersOnline[index];
        usersOnline.splice(index, 1 );
        
        socket.broadcast.emit('userDisconnected', user);
    });
});


server.listen(3333);
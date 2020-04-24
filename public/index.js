$(document).ready(function() {
    var socket = io('http://localhost:3333');
    var params = new URLSearchParams(window.location.search);
    var author = params.get('username');
    var typing=false;
    var timeout=undefined;

    function renderMessage(message) {
        $('<div class="message"><strong>' + message.author + '</strong>: ' + message.message + 
          ' <span class="date-message" style="float: right"> ' + message.time + '</span></div>')
            .insertBefore('.typing');
    };

    function renderUsersOnline(user) {
        $('#users').append('<li id=' + user.id + '>' + user.author + '</li>');
    };

    function messageUserConnected(user) {
        $('<div class="joined-message">' + user.author + ' has joinned the chat.</div>')
            .insertBefore('.typing');
    };

    function messageUserDisconnected(user) {
        $('<div class="lefted-message">' + user.author + ' has lefted the chat.</div>')
            .insertBefore('.typing');
    };

    function messageUserTyping(data) {
        if(data.typing === true) {
            $('.typing').text(`${data.author} is typing...`);
        } else {
            $('.typing').text("");
        }
    };

    function typingTimeout() {
        typing = false;
        socket.emit('userTyping', { author: author, typing: false });
    };

    socket.emit('userJoined', author);

    socket.on('userDisconnected', function(user) {
        $("#" + user.id).remove();
        messageUserDisconnected(user);
    });

    socket.on('usersOnline', function(users) {
        for (user of users) {
            renderUsersOnline(user);
        }
    })

    socket.on('userConnected', function(user) {
        renderUsersOnline(user);
        messageUserConnected(user);
    })

    socket.on('receivedMessage', function(message) {
        renderMessage(message);
    });

    socket.on('previousMessages', function(messages) {
        for (message of messages) {
            renderMessage(message);
        }
    });

    socket.on('renderUserTyping', function(data) {
        messageUserTyping(data);
    });

    $('#chat-form').submit(function(event) {
        event.preventDefault();

        const message = $('#msg').val();
        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

        if(author.length && message.length) {

            var messageObject = {
                author: author,
                message: message,
                time: hours + ':' + minutes

            }

            renderMessage(messageObject);

            socket.emit('sendMessage', messageObject); 

            $(".typing")[0].scrollIntoView({
                behavior: "smooth"
            });
            $('#msg').val('');
        }
    });

    $('#msg').keypress((e) => {
        if (e.which != 13) {
            typing = true;
            socket.emit('userTyping', { author: author, typing: true });
            clearTimeout(timeout)
            timeout = setTimeout(typingTimeout, 3000)
        } else {
            clearTimeout(timeout);
            typingTimeout();
        }
   });
})
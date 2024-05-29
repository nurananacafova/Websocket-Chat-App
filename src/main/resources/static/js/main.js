document.addEventListener('DOMContentLoaded', () => {
    let stompClient = null;
    let privateChats = new Map();
    let publicChats = [];
    let tab = 'CHATROOM';
    let userData = {
        username: '',
        receivername: '',
        connected: false,
        message: ''
    };

    const registerDiv = document.getElementById('register');
    const chatBox = document.getElementById('chat-box');
    const connectButton = document.getElementById('connect-button');
    const memberList = document.getElementById('member-list');
    const chatMessages = document.getElementById('chat-messages');
    const inputMessage = document.getElementById('input-message');
    const sendButton = document.getElementById('send-button');
    const userNameInput = document.getElementById('user-name');

    connectButton.addEventListener('click', () => {
        userData.username = userNameInput.value;
        connect();
    });

    const connect = () => {
        const sock = new SockJS('http://localhost:8080/ws');
        stompClient = Stomp.over(sock);
        stompClient.connect({}, onConnected, onError);
    };

    const onConnected = () => {
        userData.connected = true;
        registerDiv.style.display = 'none';
        chatBox.style.display = 'flex';
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe(`/user/${userData.username}/private`, onPrivateMessage);
        userJoin();
    };

    const userJoin = () => {
        const chatMessage = {
            senderName: userData.username,
            status: 'JOIN'
        };
        stompClient.send('/app/message', {}, JSON.stringify(chatMessage));
    };

    const onMessageReceived = (payload) => {
        const payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case 'JOIN':
                if (!privateChats.has(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    updateMemberList();
                }
                break;
            case 'CHAT':
                publicChats.push(payloadData);
                updatePublicChats();
                break;
        }
    };

    const onPrivateMessage = (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (!privateChats.has(payloadData.senderName)) {
            privateChats.set(payloadData.senderName, []);
            updateMemberList(); // Update member list when receiving a private message
        }
        privateChats.get(payloadData.senderName).push(payloadData);
        if (tab === payloadData.senderName) {
            updatePrivateChats();
        }
    };

    const onError = (err) => {
        console.error(err);
    };

    const sendValue = () => {
        if (stompClient) {
            const chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: 'CHAT'
            };
            stompClient.send('/app/message', {}, JSON.stringify(chatMessage));
            userData.message = '';
            inputMessage.value = '';
        }
    };

    const sendPrivateValue = () => {
        if (stompClient) {
            const chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                message: userData.message,
                status: 'CHAT'
            };
            if (privateChats.has(tab)) {
                privateChats.get(tab).push(chatMessage);
            } else {
                privateChats.set(tab, [chatMessage]);
            }
            stompClient.send('/app/private-message', {}, JSON.stringify(chatMessage));
            userData.message = '';
            inputMessage.value = '';
            updatePrivateChats();
        }
    };

    sendButton.addEventListener('click', () => {
        if (tab === 'CHATROOM') {
            sendValue();
        } else {
            sendPrivateValue();
        }
    });

    inputMessage.addEventListener('input', (event) => {
        userData.message = event.target.value;
    });


    const updateMemberList = () => {
        memberList.innerHTML = '';
        privateChats.forEach((_, name) => {
            const memberItem = document.createElement('li');
            memberItem.className = `member ${tab === name ? 'active' : ''}`;
            memberItem.dataset.tab = name;
            memberItem.textContent = name;
            memberItem.addEventListener('click', () => {
                tab = name;
                updateChatContent();
            });
            memberList.appendChild(memberItem);
        });
        // handle switching to public chatroom
        const publicChatroom = document.createElement('li');
        publicChatroom.className = `member ${tab === 'CHATROOM' ? 'active' : ''}`;
        publicChatroom.dataset.tab = 'CHATROOM';
        publicChatroom.textContent = 'Chatroom';
        publicChatroom.addEventListener('click', () => {
            tab = 'CHATROOM';
            updateChatContent();
        });
        memberList.appendChild(publicChatroom);
    };


    const updateChatContent = () => {
        if (tab === 'CHATROOM') {
            updatePublicChats();
        } else {
            updatePrivateChats();
        }
        document.querySelectorAll('.member').forEach(member => {
            member.classList.remove('active');
        });
        document.querySelector(`.member[data-tab="${tab}"]`).classList.add('active');
    };

    const updatePublicChats = () => {
        chatMessages.innerHTML = '';
        publicChats.forEach(chat => {
            const messageItem = document.createElement('li');
            messageItem.className = `message ${chat.senderName === userData.username ? 'self' : ''}`;
            messageItem.innerHTML = `
                ${chat.senderName !== userData.username ? `<div class="avatar">${chat.senderName}</div>` : ''}
                <div class="message-data">${chat.message}</div>
                ${chat.senderName === userData.username ? `<div class="avatar self">${chat.senderName}</div>` : ''}
            `;
            chatMessages.appendChild(messageItem);
        });
    };

    const updatePrivateChats = () => {
        chatMessages.innerHTML = '';
        if (privateChats.has(tab)) {
            privateChats.get(tab).forEach(chat => {
                const messageItem = document.createElement('li');
                messageItem.className = `message ${chat.senderName === userData.username ? 'self' : ''}`;
                messageItem.innerHTML = `
                    ${chat.senderName !== userData.username ? `<div class="avatar">${chat.senderName}</div>` : ''}
                    <div class="message-data">${chat.message}</div>
                    ${chat.senderName === userData.username ? `<div class="avatar self">${chat.senderName}</div>` : ''}
                `;
                chatMessages.appendChild(messageItem);
            });
        }
    };
});
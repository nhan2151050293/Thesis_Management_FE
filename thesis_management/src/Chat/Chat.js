import React, { useState, useEffect, useContext } from 'react';
import { ref, push, set, onValue } from 'firebase/database';
import { database } from '../configs/Firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { MyUserContext } from '../configs/Contexts';
import './ChatStyle.css';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { thesesCode } = useParams();
    const navigate = useNavigate();
    const user = useContext(MyUserContext);

    // Ensure user data exists
    const loggedInUser = {
        _id: user?.id || 'default-id',
        name: user?.first_name + ' ' + user?.last_name || 'Anonymous',
        avatar: user?.avatar || 'path/to/default-avatar.png',
    };

    const handleBack = () => {
        navigate('/contactlist');
    };

    useEffect(() => {
        const messagesRef = ref(database, `theses/${thesesCode}/messages`);
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const fetchedMessages = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setMessages(fetchedMessages);
            }
        });
    }, [thesesCode]);

    const onSend = async () => {
        if (input.trim().length === 0) {
            console.error('Input is empty');
            return;
        }

        const newMessage = {
            _id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            text: input,
            user: loggedInUser,
            read: false,
        };

        console.log('Sending message:', newMessage);

        try {
            const newMessageRef = push(ref(database, `theses/${thesesCode}/messages`));
            await set(newMessageRef, newMessage);
            setInput(''); // Clear input field
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button onClick={handleBack} className="back-button">
                    &#8592;
                </button>
                <h2>CHAT ROOM {thesesCode}</h2>
            </div>
            <div className="chat-body">
                <div className="messages">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${message.user._id === loggedInUser._id ? 'sent' : 'received'}`}
                        >
                            <div className="message-content">
                                {message.user._id !== loggedInUser._id && (
                                    <div className="message-avatar">
                                        <img src={message.user.avatar} alt={message.user.name} />
                                    </div>
                                )}
                                <div className="message-text">
                                    {message.user._id !== loggedInUser._id && <strong>{message.user.name}</strong>}
                                    <p>{message.text}</p>
                                    <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat-input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={onSend} className="send-button">
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;

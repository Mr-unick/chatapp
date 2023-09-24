import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import Modal from 'react-modal'; // Import react-modal

const socket = io('http://localhost:80');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sender, setSender] = useState('');
  const [userList, setUserList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(true); // State for modal

  useEffect(() => {
    socket.on('userList', (users) => {
      setUserList(users);
    });

    socket.on('message', handleMessage);

    socket.on('notification', handleNotification);

    return () => {
      socket.off('message', handleMessage);
      socket.off('notification', handleNotification);
    };
  }, []);

  const handleMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleNotification = (notification) => {
    setNotifications((prevNotifications) => [...prevNotifications, notification]);
  };

  const sendMessage = () => {
    if (message.trim() !== '') {
      const data = {
        text: message,
        sender: sender,
      };

      socket.emit('message', data);
      setMessage('');
    }
  };

  const handleNameSubmit = (event) => {
    event.preventDefault();
    setIsModalOpen(false);
    socket.emit('join', sender);
  };

  return (
    <div className={`app ${isModalOpen ? 'blur' : ''}`}>
    {
        <div className="chat">
                <div className="user-list">
                  <strong>Active Users:</strong>
                  <ul>
                    {userList.map((user, index) => (
                      <li key={index}>{user}</li>
                    ))}
                  </ul>
                </div>
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === sender ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.sender}:</p> <strong><p>{msg.text}</p></strong>
              </div>
            </div>
          ))}
        </div>
        <div className="notification-box">
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>{notification}</li>
            ))}
          </ul>
        </div>
        <div className="input-box">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    }
    <Modal isOpen={isModalOpen} className="modal">
      <h3>Enter Your Name</h3>
      <form onSubmit={handleNameSubmit}>
        
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
          />
       
        <button type="submit">Submit</button>
      </form>
    </Modal>
  </div>
  );
}

export default App;

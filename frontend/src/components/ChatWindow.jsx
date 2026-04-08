import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const ChatWindow = ({ selectedChat, fetchAgain, setFetchAgain }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers?.includes(userId.toString());
  };

  const getSenderObj = (loggedUser, users) => {
    if (!users || users.length < 2) return null;
    return users[0]._id === loggedUser._id ? users[1] : users[0];
  };

  const getParticipantNames = () => {
    if (!selectedChat || !selectedChat.participants) return '';
    return selectedChat.participants
      .map(p => p._id === user._id ? 'You' : p.username)
      .join(', ');
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/chats/${selectedChat._id}/messages`, config);
      setMessages(data);
      socket.emit('join chat', selectedChat._id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageReceived) => {
      setMessages((prevMessages) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.room._id) {
          return prevMessages;
        } else {
          return [...prevMessages, newMessageReceived];
        }
      });
      setFetchAgain((prev) => !prev);
    };

    socket.on('message received', messageHandler);

    return () => {
      socket.off('message received', messageHandler);
    };
  }, [socket, selectedChat]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !file) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
      
      const formData = new FormData();
      formData.append('roomId', selectedChat._id);
      if (newMessage.trim()) formData.append('content', newMessage);
      if (file) formData.append('media', file);

      setNewMessage('');
      setFile(null); // Clear file after send

      const { data } = await axios.post('/api/chats/messages', formData, config);
      
      socket.emit('new message', data);
      
      setMessages((prev) => [...prev, data]);
      setFetchAgain((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSender = (loggedUser, users) => {
    if (!users || users.length < 2) return '';
    return users[0]._id.toString() === loggedUser._id.toString() ? users[1].username : users[0].username;
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar" style={{ position: 'relative' }}>
          {!selectedChat.isGroup ? getSender(user, selectedChat.participants)[0].toUpperCase() : selectedChat.name[0].toUpperCase()}
          {!selectedChat.isGroup && isUserOnline(getSenderObj(user, selectedChat.participants)._id) && <div className="online-indicator"></div>}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>
            {!selectedChat.isGroup ? getSender(user, selectedChat.participants) : selectedChat.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedChat.isGroup ? (
              getParticipantNames()
            ) : (
              isUserOnline(getSenderObj(user, selectedChat.participants)._id) ? 'Online' : 'Offline'
            )}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div 
            key={m._id} 
            className={`message ${m.sender._id === user._id ? 'sent' : 'received'}`}
          >
            {m.sender._id !== user._id && selectedChat.isGroup && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', display: 'block', marginBottom: '0.2rem' }}>
                {m.sender.username}
              </span>
            )}
            
            {m.mediaUrl && (
              m.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img 
                  src={`http://localhost:5000${m.mediaUrl}`} 
                  alt="media" 
                  style={{ maxWidth: '100%', borderRadius: '0.5rem', marginBottom: '0.5rem', display: 'block' }} 
                />
              ) : m.mediaUrl.match(/\.(mp4|webm)$/i) ? (
                <video 
                  src={`http://localhost:5000${m.mediaUrl}`} 
                  controls
                  style={{ maxWidth: '100%', borderRadius: '0.5rem', marginBottom: '0.5rem', display: 'block' }} 
                />
              ) : (
                <a 
                  href={`http://localhost:5000${m.mediaUrl}`} 
                  target="_blank"
                  rel="noreferrer"
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.5rem', background: 'rgba(0,0,0,0.05)', 
                    borderRadius: '0.5rem', marginBottom: '0.5rem',
                    color: 'inherit', textDecoration: 'none'
                  }}
                  download
                >
                  <Paperclip size={16} />
                  <span>Download File</span>
                </a>
              )
            )}
            
            {m.text && <span>{m.text}</span>}
            
            <span className="time">
              {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {file && (
        <div style={{ padding: '0.5rem 1.25rem', background: '#f1f5f9', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem' }}>Attached: {file.name}</span>
          <button onClick={() => setFile(null)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      <form className="chat-input-area" onSubmit={sendMessage}>
        <label htmlFor="file-upload" className="icon-btn" title="Attach File">
          <Paperclip size={20} />
        </label>
        <input 
          id="file-upload" 
          type="file" 
          style={{ display: 'none' }} 
          accept="*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={!newMessage.trim() && !file}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

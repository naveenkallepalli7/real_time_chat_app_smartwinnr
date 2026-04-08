import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const ChatDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [fetchAgain, setFetchAgain] = useState(false);

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get('/api/chats', config);
      setChats(data);
    } catch (error) {
      console.error('Failed to load chats');
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      // Update the chats list to show the latest message or add new chat
      setChats((prevChats) => {
        const chatExists = prevChats.find((c) => c._id === newMessageReceived.room._id);
        
        if (chatExists) {
          const updatedChats = prevChats.map((chat) => {
            if (chat._id === newMessageReceived.room._id) {
              return {
                ...chat,
                lastMessage: newMessageReceived,
                updatedAt: newMessageReceived.updatedAt,
              };
            }
            return chat;
          });
          return [...updatedChats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          // If the chat doesn't exist in the list (e.g., new group invitation), re-fetch or add it
          // For simplicity and correctness, re-fetch all chats
          fetchChats();
          return prevChats;
        }
      });
    };

    socket.on('message received', handleMessageReceived);

    return () => {
      socket.off('message received', handleMessageReceived);
    };
  }, [socket]);

  return (
    <div className="dashboard-container">
      <Sidebar 
        chats={chats} 
        setChats={setChats} 
        selectedChat={selectedChat} 
        setSelectedChat={setSelectedChat} 
      />
      {selectedChat ? (
        <ChatWindow 
          selectedChat={selectedChat} 
          fetchAgain={fetchAgain} 
          setFetchAgain={setFetchAgain} 
        />
      ) : (
        <div className="chat-window" style={{ alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
          <h2>Select a chat to start messaging</h2>
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;

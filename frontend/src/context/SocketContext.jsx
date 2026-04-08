import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      const handleSetup = () => {
        console.log('Emitting setup for user:', user._id);
        newSocket.emit('setup', user);
      };

      newSocket.on('connect', () => {
        console.log('Socket Connected. ID:', newSocket.id);
        handleSetup();
        setSocketConnected(true);
      });

      // Also call setup if socket is already connected
      if (newSocket.connected) {
        handleSetup();
      }

      newSocket.on('online users', (users) => {
        console.log('RECEIVED ONLINE USERS LIST:', users);
        setOnlineUsers(users);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, socketConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

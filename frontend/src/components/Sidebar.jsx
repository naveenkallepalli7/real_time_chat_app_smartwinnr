import { useState, useEffect } from 'react';
import { Search, LogOut, PlusCircle, MessageSquare, Users, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import GroupChatModal from './GroupChatModal';
import ProfileModal from './ProfileModal';

const Sidebar = ({ chats, setChats, selectedChat, setSelectedChat }) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'users', or 'groups'
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllUsers();
    } else if (activeTab === 'groups') {
      fetchAllGroups();
    }
  }, [activeTab]);

  const fetchAllUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/users', config);
      setAllUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllGroups = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/chats/groups/search', config);
      setAllGroups(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearch(query);
    
    if (activeTab === 'chats') return;

    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const endpoint = activeTab === 'users' ? `/api/users?search=${query}` : `/api/chats/groups/search?search=${query}`;
      const { data } = await axios.get(endpoint, config);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setSearchResults([]);
  };

  const accessChat = async (userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/chats', { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      clearSearch();
      setActiveTab('chats');
    } catch (error) {
      console.error(error);
    }
  };

  const joinGroup = async (roomId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/chats/groups/join', { roomId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      clearSearch();
      setActiveTab('chats');
    } catch (error) {
      console.error(error);
    }
  };

  const getSender = (loggedUser, users) => {
    if (!users || users.length < 2) return '';
    return users[0]._id.toString() === loggedUser._id.toString() ? users[1].username : users[0].username;
  };

  const getSenderObj = (loggedUser, users) => {
    if (!users || users.length < 2) return null;
    return users[0]._id.toString() === loggedUser._id.toString() ? users[1] : users[0];
  };

  const isUserOnline = (userId) => {
    if (!userId || !onlineUsers) return false;
    const userIdStr = userId.toString();
    const isOnline = onlineUsers.includes(userIdStr);
    return isOnline;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => setIsProfileModalOpen(true)}
          title="View Profile"
        >
          <div className="avatar" style={{width: '36px', height: '36px', fontSize: '1rem', position: 'relative'}}>
            {user.username?.[0]?.toUpperCase()}
            <div className="online-indicator" style={{ background: '#22c55e', border: '2px solid white' }}></div>
          </div>
          <span style={{ fontWeight: 600 }}>{user.username}</span>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="icon-btn" onClick={() => setIsModalOpen(true)} title="Create Group Chat">
            <PlusCircle size={20} />
          </button>
          <button className="icon-btn" onClick={logout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', padding: '0.5rem 1rem', gap: '0.5rem', overflowX: 'auto' }}>
        <button 
          className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => { setActiveTab('chats'); clearSearch(); }}
          style={{ flex: 1, minWidth: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: activeTab === 'chats' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'chats' ? 'white' : 'var(--text-light)', fontWeight: 600 }}
        >
          <MessageSquare size={18} /> Chats
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); clearSearch(); }}
          style={{ flex: 1, minWidth: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: activeTab === 'users' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'users' ? 'white' : 'var(--text-light)', fontWeight: 600 }}
        >
          <Users size={18} /> Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => { setActiveTab('groups'); clearSearch(); }}
          style={{ flex: 1, minWidth: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: activeTab === 'groups' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'groups' ? 'white' : 'var(--text-light)', fontWeight: 600 }}
        >
          <Hash size={18} /> Groups
        </button>
      </div>

      <div className="sidebar-search">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder={activeTab === 'chats' ? "Search your chats..." : activeTab === 'users' ? "Search all users..." : "Search all groups..."}
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="chat-list">
        {activeTab === 'chats' ? (
          chats.length > 0 ? (
            chats
              .filter(chat => {
                if (!search) return true;
                if (chat.isGroup) {
                  return chat.name?.toLowerCase().includes(search.toLowerCase());
                } else {
                  return getSender(user, chat.participants).toLowerCase().includes(search.toLowerCase());
                }
              })
              .map((chat) => (
                <div 
                  key={chat._id} 
                  className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="avatar" style={{ position: 'relative' }}>
                    {!chat.isGroup ? getSender(user, chat.participants)[0]?.toUpperCase() : chat.name?.[0]?.toUpperCase()}
                    {!chat.isGroup && isUserOnline(getSenderObj(user, chat.participants)?._id) && <div className="online-indicator"></div>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {!chat.isGroup ? getSender(user, chat.participants) : chat.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '200px', overflow: 'hidden' }}>
                      {chat.lastMessage ? (
                        <>
                          {(chat.lastMessage.sender?._id === user._id || chat.lastMessage.sender === user._id) && <span>You: </span>}
                          <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {chat.lastMessage.text || (chat.lastMessage.mediaUrl ? 'Media sent' : '...')}
                          </span>
                        </>
                      ) : (
                        'No messages'
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
              No chats yet. Search for users to start a conversation.
            </div>
          )
        ) : search ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'users' && (
              searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div key={result._id} className="chat-item" onClick={() => accessChat(result._id)}>
                    <div className="avatar" style={{ position: 'relative' }}>
                      {result.username?.[0]?.toUpperCase()}
                      {isUserOnline(result._id) && <div className="online-indicator"></div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{result.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{result.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                  No users found for "{search}"
                </div>
              )
            )}

            {activeTab === 'groups' && (
              <>
                {/* Matched in Your Groups */}
                {chats.filter(c => c.isGroup && c.name?.toLowerCase().includes(search.toLowerCase())).length > 0 && (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', background: 'rgba(59, 130, 246, 0.05)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Your Groups
                  </div>
                )}
                {chats
                  .filter(c => c.isGroup && c.name?.toLowerCase().includes(search.toLowerCase()))
                  .map((chat) => (
                    <div 
                      key={chat._id} 
                      className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                      onClick={() => { setSelectedChat(chat); setActiveTab('chats'); clearSearch(); }}
                    >
                      <div className="avatar">
                        {chat.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{chat.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{chat.participants?.length || 0} members</div>
                      </div>
                    </div>
                  ))
                }

                {/* Global Results */}
                {searchResults.filter(r => !chats.some(c => c._id === r._id)).length > 0 && (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', background: 'rgba(0,0,0,0.02)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
                    Discover Global
                  </div>
                )}
                {searchResults
                  .filter(r => !chats.some(c => c._id === r._id))
                  .map((result) => (
                    <div key={result._id} className="chat-item" onClick={() => joinGroup(result._id)}>
                      <div className="avatar">
                        {result.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{result.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                          {result.participants?.length || 0} members
                        </div>
                      </div>
                    </div>
                  ))
                }

                {chats.filter(c => c.isGroup && c.name?.toLowerCase().includes(search.toLowerCase())).length === 0 && 
                 searchResults.filter(r => !chats.some(c => c._id === r._id)).length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                    No groups found for "{search}"
                  </div>
                )}
              </>
            )}
          </div>
        ) : activeTab === 'users' ? (
          allUsers.length > 0 ? (
            allUsers.map((u) => (
              <div key={u._id} className="chat-item" onClick={() => accessChat(u._id)}>
                <div className="avatar" style={{ position: 'relative' }}>
                  {u.username?.[0]?.toUpperCase()}
                  {isUserOnline(u._id) && <div className="online-indicator"></div>}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.username}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{isUserOnline(u._id) ? 'Online' : 'Offline'}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
              No users available.
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {chats.filter(c => c.isGroup).length > 0 && (
              <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', background: 'rgba(59, 130, 246, 0.05)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Groups
              </div>
            )}
            {chats.filter(c => c.isGroup).map((chat) => (
              <div 
                key={chat._id} 
                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => { setSelectedChat(chat); setActiveTab('chats'); }}
              >
                <div className="avatar">
                  {chat.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{chat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{chat.participants?.length || 0} members</div>
                </div>
              </div>
            ))}
            
            <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', background: 'rgba(0,0,0,0.02)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
              Discover Groups
            </div>
            {allGroups.filter(g => !chats.some(c => c._id === g._id)).length > 0 ? (
              allGroups.filter(g => !chats.some(c => c._id === g._id)).map((g) => (
                <div key={g._id} className="chat-item" onClick={() => joinGroup(g._id)}>
                  <div className="avatar">
                    {g.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{g.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{g.participants?.length || 0} members</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem' }}>
                No new groups to discover.
              </div>
            )}
          </div>
        )}
      </div>

      <GroupChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} chats={chats} setChats={setChats} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} />
    </div>
  );
};

export default Sidebar;

import { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GroupChatModal = ({ isOpen, onClose, chats, setChats }) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/users?search=${query}`, config);
      setSearchResults(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to search users');
      setLoading(false);
    }
  };

  const handleSelectUser = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) return;
    setSelectedUsers([...selectedUsers, userToAdd]);
    setSearch('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName || selectedUsers.length < 2) {
      setError('Please provide a group name and select at least 2 users');
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        '/api/chats/group',
        {
          name: groupName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      // Reset form
      setGroupName('');
      setSelectedUsers([]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create Group Chat</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Group Name</label>
            <input 
              type="text" 
              placeholder="Enter group name" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Add Users (at least 2)</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Selected Users Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {selectedUsers.map((u) => (
              <div key={u._id} style={{ 
                background: 'var(--primary-color)', 
                color: 'white', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '1rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {u.username}
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveUser(u._id)} />
              </div>
            ))}
          </div>

          {/* Search Results */}
          <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
            {searchResults.slice(0, 4).map((u) => (
              <div 
                key={u._id} 
                onClick={() => handleSelectUser(u)}
                style={{ 
                  padding: '0.75rem 1rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)'
                }}
              >
                <span>{u.username}</span>
                {selectedUsers.some((selected) => selected._id === u._id) && <Check size={16} color="var(--primary-color)" />}
              </div>
            ))}
            {search && searchResults.length === 0 && !loading && (
              <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-light)' }}>No users found</div>
            )}
          </div>

          {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChatModal;

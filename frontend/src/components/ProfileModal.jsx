import { X, Mail, User, Calendar } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          padding: '2rem', 
          maxWidth: '400px', 
          width: '90%',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div className="avatar" style={{ 
            width: '100px', 
            height: '100px', 
            fontSize: '3rem', 
            margin: '0 auto 1rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            {user.username?.[0]?.toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{user.username}</h2>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>{user.email}</p>
        </div>

        <div style={{ 
          textAlign: 'left', 
          background: 'rgba(0,0,0,0.02)', 
          padding: '1.5rem', 
          borderRadius: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={18} color="var(--primary-color)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Username</div>
              <div style={{ fontWeight: 500 }}>{user.username}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={18} color="var(--primary-color)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</div>
              <div style={{ fontWeight: 500 }}>{user.email}</div>
            </div>
          </div>

          {user.createdAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={18} color="var(--primary-color)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Member Since</div>
                <div style={{ fontWeight: 500 }}>{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          )}
        </div>

        <button 
          className="auth-btn" 
          onClick={onClose} 
          style={{ marginTop: '2rem' }}
        >
          Close Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;

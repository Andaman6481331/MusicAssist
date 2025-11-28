import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { logout, subscribeAuth } from '.';
import { useGlobalBoolean } from '../GlobalBooleanContext.tsx';

const AuthControls = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { setIsGlobalEnabled } = useGlobalBoolean();


  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      setEmail(user?.email ?? null);

      if (user) {
        setIsGlobalEnabled(true);   // logged in
      } else {
        setIsGlobalEnabled(false);  // logged out
      }

      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      if (!menuRef.current) return;
      if (!(ev.target instanceof Node)) return;
      if (!menuRef.current.contains(ev.target)) {
        setMenuOpen(false);
      }
    }
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  if (loading) return null;

  if (!email) {
    return (
      <Link className="title" to="/login">
        Login
      </Link>
    );
  }

  const username = (email.split('@')[0] || 'User');
  const initial = username.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="user-menu" style={{ position: 'relative' }}>
      <button
        className="user-avatar"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        title={email}
      >
        <span className="user-initial">{initial}</span>
      </button>
      <div className={`user-dropdown ${menuOpen ? 'open' : ''}`} role="menu">
        <div className="user-meta">
          <div className="user-name">{username}</div>
          <div className="user-email" title={email}>{email}</div>
        </div>
        <Link className="user-item" role="menuitem" to="/data" onClick={() => setMenuOpen(false)}>My List</Link>
        <button className="user-item danger" role="menuitem" style={{ width: '100%' }} onClick={() => { setMenuOpen(false); logout(); }}>Logout</button>
      </div>
    </div>
  );
};

export default AuthControls;



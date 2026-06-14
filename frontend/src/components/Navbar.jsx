
import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext';
import defaultProfilePic from './profile.jpg';

function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 818);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 818);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleLinkClick() {
    setOpen(false);
    setSearchOpen(false);
  }

  const navItems = [
    { path: "/", icon: "🏠", label: "Home" },
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/courses", icon: "📚", label: "Courses" },
    { path: "/communication", icon: "💬", label: "Comm" },
    { path: "/stress-relief", icon: "🧘", label: "Stress" },
    { path: "/ai-support", icon: "🤖", label: "AI" },
    { path: "/human-help", icon: "👥", label: "Help" },
    { path: "/posture-assistant", icon: "🪑", label: "Posture" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      
      <header className={`nav-header-enhanced ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-left-enhanced">
          <div className="nav-logo-enhanced">
            <div className="logo-icon-wrapper">
              <span className="logo-icon-enhanced">⚡</span>
              <span className="logo-pulse"></span>
            </div>
            <div className="logo-text-wrapper">
              <span className="logo-text-main">SmartLearning</span>
              <span className="logo-text-sub">AI Powered</span>
            </div>
          </div>
        </div>

        
        {isDesktop && (
          <nav className="nav-links-enhanced">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link-enhanced ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-link-icon">{item.icon}</span>
                <span className="nav-link-text">{item.label}</span>
                <span className="nav-link-glow"></span>
              </NavLink>
            ))}
          </nav>
        )}

        <div className="nav-right-enhanced">
        
          {isDesktop && (
            <div className="search-wrapper">
              <button
                className="search-btn-enhanced"
                onClick={() => setSearchOpen(!searchOpen)}
              ><span className="nav-link-icon">🔍</span>
              </button>
              <span className="nav-link-text">Search</span>
              {searchOpen && (
                <form className="search-dropdown" onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button type="submit">Go</button>
                </form>
              )}
            </div>
          )}

         
          <button type="button" className="theme-toggle-enhanced" onClick={toggleTheme}>
            <div className={`theme-toggle-track ${theme === 'light' ? 'light' : 'dark'}`}>
              <div className="theme-toggle-thumb">
                {theme === 'light' ? '☀️' : '🌙'}
              </div>
            </div>
            <span className="theme-label-enhanced">
              {theme === 'light' ? 'Light' : 'Dark'}
            </span>
          </button>

        
          {isDesktop && user && (
            <div className="user-menu-enhanced">
              <div className="user-avatar-wrapper">
                <div
                  className="user-avatar-enhanced"
                  style={{ backgroundImage: `url(${user.profilePicture || defaultProfilePic})` }}
                ></div>
                <div className="user-status online"></div>
              </div>
              <div className="user-dropdown">
                <NavLink to="/profile" className="dropdown-item">
                  <span>👤</span> Profile
                </NavLink>
                <button className="dropdown-item logout" onClick={logout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>
          )}

      
          {isDesktop && !user && (
            <div className="auth-buttons-enhanced">
              <NavLink to="/login" className="auth-btn login">Sign In</NavLink>
              <NavLink to="/signup" className="auth-btn signup">Sign Up ✨</NavLink>
            </div>
          )}

          {!isDesktop && (
            <button
              type="button"
              className={`hamburger-enhanced ${open ? 'open' : ''}`}
              aria-label="Toggle menu"
              onClick={() => setOpen(prev => !prev)}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          )}
        </div>

        {!isDesktop && (
          <div className={`mobile-menu-enhanced ${open ? 'open' : ''}`}>
            <div className="mobile-menu-header">
              {user && (
                <div className="mobile-user-info">


                  <NavLink to="/profile" onClick={handleLinkClick} className="mobile-auth-btn">
                    <div
                      className="mobile-user-avatar"
                      style={{ backgroundImage: `url(${user.profilePicture || defaultProfilePic})` }}
                    >

                    </div>
                  </NavLink>

                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user.name}</span>
                    <span className="mobile-user-email">{user.email}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mobile-menu-items">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `mobile-item-enhanced ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="mobile-item-icon">{item.icon}</span>
                  <span className="mobile-item-text">{item.label}</span>
                  <span className="mobile-item-arrow">→</span>
                </NavLink>
              ))}
            </div>

            {!user ? (
              <div className="mobile-auth-buttons">
                <NavLink to="/login" onClick={handleLinkClick} className="mobile-auth-btn login">
                  Sign In
                </NavLink>
                <NavLink to="/signup" onClick={handleLinkClick} className="mobile-auth-btn signup">
                  Sign Up ✨
                </NavLink>
              </div>
            ) : (
              <button className="mobile-logout-btn" onClick={() => { logout(); handleLinkClick(); }}>
                <span>🚪</span> Logout
              </button>
            )}
          </div>
        )}
      </header>

     
      {isDesktop && (
        <div className={`sidebar-enhanced ${scrolled ? 'scrolled' : ''}`}>
          <div className="sidebar-header-enhanced">
            <div className="sidebar-logo">
              <span className="sidebar-logo-icon">⚡</span>
              <span>Menu</span>
            </div>
          </div>

          <nav className="sidebar-nav-enhanced">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link-enhanced ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-link-icon">{item.icon}</span>
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="sidebar-footer-enhanced">
              <NavLink to="/profile" className="sidebar-profile">
                <div
                  className="sidebar-profile-avatar"
                  style={{ backgroundImage: `url(${user.profilePicture || defaultProfilePic})` }}
                ></div>
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
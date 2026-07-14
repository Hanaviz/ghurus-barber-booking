"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Scissors, Menu, X, LogOut } from 'lucide-react';
import { checkAdminSession, logoutAdmin } from '@/app/admin/actions';

export default function NavigasiBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogoutClick = async () => {
    try {
      await logoutAdmin();
      window.dispatchEvent(new Event('admin-login-status-change'));
      closeSidebar();
      router.push('/');
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await checkAdminSession();
        setIsLoggedIn(auth);
      } catch {
        setIsLoggedIn(false);
      }
    };
    
    checkAuth();
    
    window.addEventListener('admin-login-status-change', checkAuth);
    return () => {
      window.removeEventListener('admin-login-status-change', checkAuth);
    };
  }, [pathname]);

  const isAdminActive = pathname.startsWith('/admin') && isLoggedIn;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link href="/" className="logo" onClick={closeSidebar} style={{ display: 'flex', alignItems: 'center' }}>
            <Scissors size={24} />
            <span>Ghurus Barber Clinic</span>
            {isAdminActive && (
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: 'rgba(197, 168, 128, 0.15)', 
                color: 'var(--primary)', 
                padding: '0.2rem 0.5rem', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid rgba(197, 168, 128, 0.3)', 
                marginLeft: '0.65rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif" 
              }}>
                Admin
              </span>
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links-desktop">
            {!isAdminActive ? (
              <>
                <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                  Booking Baru
                </Link>
                <Link href="/booking-status" className={`nav-link ${pathname === '/booking-status' ? 'active' : ''}`}>
                  Cek & Reschedule
                </Link>
                <Link href="/admin" className="nav-btn-admin">
                  Admin Panel
                </Link>
              </>
            ) : (
              <span style={{ 
                color: 'var(--primary)', 
                fontWeight: 700, 
                fontSize: '0.85rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                border: '1px solid rgba(197, 168, 128, 0.25)', 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(197, 168, 128, 0.05)',
                fontFamily: "'Outfit', sans-serif"
              }}>
                Mode Admin Aktif
              </span>
            )}
          </nav>

          {/* Hamburger Button (Mobile Only) */}
          <button 
            className="menu-toggle-btn" 
            onClick={toggleSidebar} 
            aria-label="Buka Menu"
            type="button"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      {/* Sidebar Drawer */}
      <div className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="logo" onClick={closeSidebar} style={{ display: 'flex', alignItems: 'center' }}>
            <Scissors size={20} />
            <span style={{ fontSize: '1.05rem' }}>Ghurus Barber Clinic</span>
            {isAdminActive && (
              <span style={{ 
                fontSize: '0.65rem', 
                backgroundColor: 'rgba(197, 168, 128, 0.15)', 
                color: 'var(--primary)', 
                padding: '0.15rem 0.4rem', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid rgba(197, 168, 128, 0.3)', 
                marginLeft: '0.5rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                fontWeight: 700 
              }}>
                Admin
              </span>
            )}
          </Link>
          <button 
            className="sidebar-close-btn" 
            onClick={closeSidebar} 
            aria-label="Tutup Menu"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {!isAdminActive ? (
            <>
              <Link 
                href="/" 
                className={`sidebar-link ${pathname === '/' ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                Booking Baru
              </Link>
              <Link 
                href="/booking-status" 
                className={`sidebar-link ${pathname === '/booking-status' ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                Cek & Reschedule
              </Link>
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <Link 
                  href="/admin" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                  onClick={closeSidebar}
                >
                  Admin Panel
                </Link>
              </div>
            </>
          ) : (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button 
                onClick={handleLogoutClick}
                className="btn btn-danger" 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600
                }}
              >
                <LogOut size={16} />
                Keluar Mode Admin
              </button>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

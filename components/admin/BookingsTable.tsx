"use client";

import React, { useState } from 'react';
import { Phone, Clock, Check, X, Trash2, Scissors, Sun, Moon } from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  queue_number: number;
  status: 'Menunggu' | 'Sedang Dicukur' | 'Selesai' | 'Batal';
  session?: 'siang' | 'malam';
  created_at: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  getStatusBadge: (status: string) => React.ReactNode;
  handleUpdateStatus: (id: string, status: 'Sedang Dicukur' | 'Selesai' | 'Menunggu' | 'Batal') => void;
  handleDeleteBooking: (id: string) => void;
  handleCallBooking?: (booking: Booking) => void;
}

export default function BookingsTable({
  bookings,
  handleUpdateStatus,
  handleDeleteBooking
}: BookingsTableProps) {
  const [activeTab, setActiveTab] = useState<'siang' | 'malam'>('siang');

  // Urutkan antrean: Sedang Dicukur (Top) -> Menunggu (Middle) -> Selesai / Batal (Bottom)
  const sortFn = (a: Booking, b: Booking) => {
    const getOrder = (status: string) => {
      if (status === 'Sedang Dicukur') return 0;
      if (status === 'Menunggu') return 1;
      return 2;
    };
    const orderA = getOrder(a.status);
    const orderB = getOrder(b.status);
    if (orderA !== orderB) return orderA - orderB;
    return a.queue_number - b.queue_number;
  };

  const siangBookings = bookings.filter(b => b.session === 'siang').sort(sortFn);
  const malamBookings = bookings.filter(b => b.session === 'malam').sort(sortFn);

  const renderBookingCard = (booking: Booking) => {
    const isMalam = booking.session === 'malam';
    const isDoneOrCancel = booking.status === 'Selesai' || booking.status === 'Batal';
    const isProcess = booking.status === 'Sedang Dicukur';

    return (
      <div 
        key={booking.id} 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.6rem 0.75rem',
          backgroundColor: isProcess ? 'rgba(245, 158, 11, 0.05)' : isDoneOrCancel ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.025)',
          border: '1px solid ' + (isProcess ? 'rgba(245, 158, 11, 0.4)' : 'var(--border)'),
          borderRadius: 'var(--radius-md)',
          gap: '0.75rem',
          opacity: isDoneOrCancel ? 0.45 : 1,
          transition: 'all 0.25s ease'
        }}
        className="booking-compact-card"
      >
        {/* Left Side: Badge & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '130px', flex: '1 1 auto' }}>
          <span style={{ 
            backgroundColor: isMalam ? '#8b5cf6' : '#f59e0b', 
            color: isMalam ? '#fff' : '#000', 
            fontWeight: 800, 
            padding: '0.2rem 0.45rem', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.75rem',
            minWidth: '40px',
            textAlign: 'center'
          }}>
            {isMalam ? 'M-' : 'S-'}{booking.queue_number}
          </span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ 
              fontWeight: 700, 
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              textDecoration: isDoneOrCancel ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px'
            }} title={booking.name}>
              {booking.name}
            </span>
            {isProcess && (
              <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                ✂️ Sedang Dicukur
              </span>
            )}
          </div>
        </div>

        {/* Middle Side: WA & Booking Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }} className="booking-card-mid-info">
          <a 
            href={`https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)', fontWeight: 600 }}
            title="Hubungi WhatsApp"
          >
            <Phone size={12} />
            <span className="hide-on-mobile">{booking.whatsapp}</span>
          </a>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
            <Clock size={12} style={{ color: 'var(--primary)' }} />
            {booking.booking_time ? booking.booking_time.substring(0, 5).replace(':', '.') : '-'}
          </span>
        </div>

        {/* Right Side: Quick Action Icon Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ display: 'flex', gap: '0.2rem' }}>
            {/* 1. Tombol Icon Menunggu (Kiri) */}
            <button 
              className="btn-icon" 
              onClick={() => handleUpdateStatus(booking.id, 'Menunggu')} 
              style={{ 
                backgroundColor: booking.status === 'Menunggu' ? 'var(--warning-bg)' : 'transparent', 
                color: booking.status === 'Menunggu' ? 'var(--warning)' : 'var(--text-muted)', 
                borderColor: booking.status === 'Menunggu' ? 'var(--warning)' : 'var(--border)', 
                width: '26px', 
                height: '26px' 
              }}
              title="Tandai Menunggu"
              type="button"
            >
              <Clock size={13} />
            </button>

            {/* 2. Tombol Icon Memotong / Sedang Dicukur */}
            <button 
              className="btn-icon" 
              onClick={() => handleUpdateStatus(booking.id, 'Sedang Dicukur')} 
              style={{ 
                backgroundColor: isProcess ? 'rgba(245, 158, 11, 0.25)' : 'transparent', 
                color: isProcess ? '#f59e0b' : 'var(--text-muted)', 
                borderColor: isProcess ? '#f59e0b' : 'var(--border)', 
                width: '26px', 
                height: '26px' 
              }}
              title="Mulai Cukur / Sedang Dicukur"
              type="button"
            >
              <Scissors size={13} />
            </button>

            {/* 3. Tombol Icon Centang (Selesai) */}
            <button 
              className="btn-icon" 
              onClick={() => handleUpdateStatus(booking.id, 'Selesai')} 
              style={{ 
                backgroundColor: booking.status === 'Selesai' ? 'var(--success-bg)' : 'transparent', 
                color: booking.status === 'Selesai' ? 'var(--success)' : 'var(--text-muted)', 
                borderColor: booking.status === 'Selesai' ? 'var(--success)' : 'var(--border)', 
                width: '26px', 
                height: '26px' 
              }}
              title="Tandai Selesai"
              type="button"
            >
              <Check size={13} />
            </button>

            {/* 4. Tombol Icon Batal */}
            <button 
              className="btn-icon btn-icon-danger" 
              onClick={() => handleUpdateStatus(booking.id, 'Batal')} 
              style={{ 
                backgroundColor: booking.status === 'Batal' ? 'var(--danger-bg)' : 'transparent', 
                color: booking.status === 'Batal' ? 'var(--danger)' : 'var(--text-muted)', 
                borderColor: booking.status === 'Batal' ? 'var(--danger)' : 'var(--border)', 
                width: '26px', 
                height: '26px' 
              }}
              title="Tandai Batal"
              type="button"
            >
              <X size={13} />
            </button>
          </div>
          
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)', margin: '0 0.1rem' }} />
          
          {/* 5. Tombol Icon Hapus (Ujung Kanan) */}
          <button 
            className="btn-icon btn-icon-danger" 
            onClick={() => handleDeleteBooking(booking.id)}
            title="Hapus Booking"
            style={{ width: '26px', height: '26px' }}
            type="button"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Mobile Tabs Navigator */}
      <div className="bookings-tab-nav">
        <button
          onClick={() => setActiveTab('siang')}
          className={`tab-nav-btn ${activeTab === 'siang' ? 'active-tab' : ''}`}
          style={{
            borderBottom: '2px solid',
            borderColor: activeTab === 'siang' ? '#f59e0b' : 'transparent',
            color: activeTab === 'siang' ? '#f59e0b' : 'var(--text-muted)',
            fontWeight: 700
          }}
          type="button"
        >
          ☀️ Sesi Siang ({siangBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('malam')}
          className={`tab-nav-btn ${activeTab === 'malam' ? 'active-tab' : ''}`}
          style={{
            borderBottom: '2px solid',
            borderColor: activeTab === 'malam' ? '#8b5cf6' : 'transparent',
            color: activeTab === 'malam' ? '#8b5cf6' : 'var(--text-muted)',
            fontWeight: 700
          }}
          type="button"
        >
          🌙 Sesi Malam ({malamBookings.length})
        </button>
      </div>

      {/* Dual Column Container */}
      <div className="bookings-split-container">
        
        {/* Column Left: Sesi Siang */}
        <div className={`bookings-column ${activeTab === 'siang' ? 'active-column' : ''}`}>
          <div className="column-header-desktop">
            <Sun size={16} style={{ color: '#f59e0b' }} />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sesi Siang ({siangBookings.length})
            </h4>
          </div>
          
          <div className="bookings-compact-list">
            {siangBookings.length === 0 ? (
              <div className="empty-column-placeholder">
                Belum ada antrean di Sesi Siang.
              </div>
            ) : (
              siangBookings.map(renderBookingCard)
            )}
          </div>
        </div>

        {/* Column Right: Sesi Malam */}
        <div className={`bookings-column ${activeTab === 'malam' ? 'active-column' : ''}`}>
          <div className="column-header-desktop">
            <Moon size={16} style={{ color: '#8b5cf6' }} />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sesi Malam ({malamBookings.length})
            </h4>
          </div>
          
          <div className="bookings-compact-list">
            {malamBookings.length === 0 ? (
              <div className="empty-column-placeholder">
                Belum ada antrean di Sesi Malam.
              </div>
            ) : (
              malamBookings.map(renderBookingCard)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Ticket, XCircle, Sun, Moon } from 'lucide-react';

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

interface BookingListProps {
  bookings: Booking[];
  formatDateIndo: (dateStr: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  handleCancelBooking: (bookingId: string) => void;
  siangCurrent: number;
  malamCurrent: number;
}

export default function BookingList({
  bookings,
  formatDateIndo,
  getStatusBadge,
  handleCancelBooking,
  siangCurrent,
  malamCurrent
}: BookingListProps) {
  if (bookings.length === 0) return null;

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();

  return (
    <div style={{ marginTop: '2rem', animation: 'slideUp 0.3s ease' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Status Antrean: <span style={{ color: 'var(--primary)' }}>{bookings[0].name}</span>
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {bookings.map((booking) => {
          const isToday = booking.booking_date === todayStr;
          const myTicket = booking.queue_number || 0;
          
          const isMalam = booking.session === 'malam';
          const prefix = isMalam ? 'M-' : 'S-';
          const activeCalledQueue = isMalam ? malamCurrent : siangCurrent;
          const waitCount = myTicket - activeCalledQueue;
          const sessionColor = isMalam ? '#a78bfa' : '#f59e0b';
          
          return (
            <div key={booking.id} className="booking-item-card" style={{ 
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              {/* Header */}
              <div className="booking-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatDateIndo(booking.booking_date)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {isMalam ? (
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.2)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                      <Moon size={10} /> Malam
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                      <Sun size={10} /> Siang
                    </span>
                  )}
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Ticket and Active Queue Display */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.01)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.04)'
              }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Tiket Anda</span>
                  <strong style={{ fontSize: '1.25rem', color: sessionColor }}>No. {prefix}{myTicket}</strong>
                </div>
                {isToday && booking.status === 'Menunggu' ? (
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Antrean Berjalan</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>No. {prefix}{activeCalledQueue}</strong>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Jam Daftar</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {booking.booking_time ? booking.booking_time.substring(0, 5).replace(':', '.') : '-'} WIB
                    </strong>
                  </div>
                )}
              </div>

              {/* Dynamic Queue Status Message (Only for today's active tickets) */}
              {isToday && booking.status === 'Menunggu' && (
                <div style={{ marginTop: '-0.25rem' }}>
                  {waitCount < 0 ? (
                    <div style={{ 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: 'rgba(239, 68, 68, 0.04)', 
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem'
                    }}>
                      <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                      <span>Nomor antrean Anda sudah terlewati. Harap hubungi owner di toko.</span>
                    </div>
                  ) : waitCount === 0 ? (
                    <div style={{ 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                      <span>GILIRAN ANDA SEKARANG! Silakan masuk ke dalam barber.</span>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: 'rgba(197, 168, 128, 0.05)', 
                      border: '1px dashed var(--primary)', 
                      color: 'var(--primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Clock size={15} />
                        <span>Sisa Antrean: {waitCount} Orang Lagi</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', paddingLeft: '1.25rem' }}>
                        Estimasi waktu tunggu sekitar **{waitCount * 15} - {waitCount * 20} menit**.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              {booking.status === 'Menunggu' && (
                <div style={{ display: 'flex', width: '100%', marginTop: '0.25rem' }}>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="btn btn-secondary btn-danger"
                    style={{ 
                      padding: '0.65rem 1rem', 
                      fontSize: '0.9rem', 
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      borderColor: 'rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <XCircle size={16} /> Batalkan Antrean
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

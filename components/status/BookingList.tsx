"use client";

import React from 'react';
import { Calendar, Clock, Edit2, Trash2 } from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  status: 'Menunggu' | 'Selesai' | 'Batal';
  created_at: string;
}

interface BookingListProps {
  bookings: Booking[];
  formatDateIndo: (dateStr: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  openRescheduleModal: (booking: Booking) => void;
  handleCancelBooking: (bookingId: string) => void;
}

export default function BookingList({
  bookings,
  formatDateIndo,
  getStatusBadge,
  openRescheduleModal,
  handleCancelBooking
}: BookingListProps) {
  if (bookings.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem', animation: 'slideUp 0.3s ease' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        Daftar Booking Pelanggan: <span style={{ color: 'var(--primary)' }}>{bookings[0].name}</span>
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-item-card">
            <div className="booking-item-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>{formatDateIndo(booking.booking_date)}</span>
              </div>
              {getStatusBadge(booking.status)}
            </div>

            <div className="booking-item-details">
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jam Booking</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <Clock size={16} style={{ color: 'var(--primary)' }} />
                  {booking.booking_time.substring(0, 5).replace(':', '.')} WIB
                </strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nama WhatsApp</span>
                <span style={{ display: 'block', marginTop: '0.25rem' }}>{booking.whatsapp}</span>
              </div>
            </div>

            {booking.status === 'Menunggu' && (
              <div className="booking-item-actions">
                <button
                  onClick={() => openRescheduleModal(booking)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', flex: 1 }}
                >
                  <Edit2 size={16} /> Reschedule
                </button>
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="btn btn-secondary btn-danger"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto' }}
                  title="Batalkan Booking"
                >
                  <Trash2 size={16} /> Batal
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

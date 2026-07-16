"use client";

import React from 'react';
import { Phone, Clock, Check, X, Edit2, Trash2 } from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  status: 'Menunggu' | 'Selesai' | 'Batal';
  created_at: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  TIME_SLOTS: string[];
  getStatusBadge: (status: string) => React.ReactNode;
  handleUpdateStatus: (id: string, status: 'Selesai' | 'Menunggu' | 'Batal') => void;
  handleDeleteBooking: (id: string) => void;
  openRescheduleModal: (booking: Booking) => void;
}

export default function BookingsTable({
  bookings,
  TIME_SLOTS,
  getStatusBadge,
  handleUpdateStatus,
  handleDeleteBooking,
  openRescheduleModal
}: BookingsTableProps) {
  return (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Antrean</th>
            <th>Nama</th>
            <th>WhatsApp</th>
            <th>Jam Booking</th>
            <th>Status</th>
            <th>Konfirmasi Cepat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td data-label="Antrean">
                {(() => {
                  const timeClean = booking.booking_time ? booking.booking_time.substring(0, 5).replace(':', '.') : '';
                  const queueNo = TIME_SLOTS.indexOf(timeClean) + 1;
                  return queueNo > 0 ? (
                    <span style={{ 
                      backgroundColor: 'rgba(197, 168, 128, 0.1)', 
                      color: 'var(--primary)', 
                      fontWeight: 600, 
                      padding: '0.2rem 0.55rem', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid rgba(197, 168, 128, 0.25)',
                      fontSize: '0.85rem',
                      display: 'inline-block'
                    }}>
                      No. {queueNo}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  );
                })()}
              </td>
              <td data-label="Nama" style={{ fontWeight: 600 }}>{booking.name}</td>
              <td data-label="WhatsApp">
                <a 
                  href={`https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)' }}
                  title="Hubungi via WhatsApp"
                >
                  <Phone size={14} />
                  {booking.whatsapp}
                </a>
              </td>
              <td data-label="Jam Booking">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <Clock size={14} style={{ color: 'var(--primary)' }} />
                  {booking.booking_time.substring(0, 5).replace(':', '.')}
                </span>
              </td>
              <td data-label="Status">{getStatusBadge(booking.status)}</td>
              <td data-label="Konfirmasi">
                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleUpdateStatus(booking.id, 'Selesai')} 
                    style={booking.status === 'Selesai' ? { backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderColor: 'var(--success)' } : {}}
                    title="Tandai Selesai"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleUpdateStatus(booking.id, 'Menunggu')} 
                    style={booking.status === 'Menunggu' ? { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderColor: 'var(--warning)' } : {}}
                    title="Tandai Menunggu"
                  >
                    <Clock size={16} />
                  </button>
                  <button 
                    className="btn-icon btn-icon-danger" 
                    onClick={() => handleUpdateStatus(booking.id, 'Batal')} 
                    style={booking.status === 'Batal' ? { backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger)' } : {}}
                    title="Tandai Batal"
                  >
                    <X size={16} />
                  </button>
                </div>
              </td>
              <td data-label="Aksi">
                <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-icon" 
                    onClick={() => openRescheduleModal(booking)}
                    title="Reschedule / Edit Jadwal"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn-icon btn-icon-danger" 
                    onClick={() => handleDeleteBooking(booking.id)}
                    title="Hapus Booking Permanen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { User, Phone, Calendar, Clock, AlertCircle, CalendarRange, CheckCircle2 } from 'lucide-react';

interface BookedSlot {
  time: string;
  name: string;
}

interface BookingFormProps {
  name: string;
  setName: (val: string) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  selectedTime: string;
  setSelectedTime: (val: string) => void;
  bookedSlots: BookedSlot[];
  isLoadingSlots: boolean;
  isSubmitting: boolean;
  isEnvConfigured: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  handleSubmit: (e: React.FormEvent) => void;
  handleDateClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isSlotPast: (dateStr: string, timeStr: string) => boolean;
  TIME_SLOTS: string[];
}

export default function BookingForm({
  name,
  setName,
  whatsapp,
  setWhatsapp,
  date,
  setDate,
  selectedTime,
  setSelectedTime,
  bookedSlots,
  isLoadingSlots,
  isSubmitting,
  isEnvConfigured,
  message,
  handleSubmit,
  handleDateClick,
  isSlotPast,
  TIME_SLOTS
}: BookingFormProps) {
  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          padding: '1rem', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(197, 168, 128, 0.1)', 
          color: 'var(--primary)',
          marginBottom: '1rem'
        }}>
          <CalendarRange size={32} />
        </div>
        <h1 className="card-title">Booking Jadwal</h1>
        <p className="card-subtitle">Pilih jadwal potong rambut terbaik Anda dengan cepat dan mudah</p>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div>{message.text}</div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nama Lengkap</label>
          <div className="input-icon-wrapper">
            <User />
            <input
              type="text"
              className="form-control"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Nomor WhatsApp</label>
          <div className="input-icon-wrapper">
            <Phone />
            <input
              type="tel"
              className="form-control"
              placeholder="Contoh: 081234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Pilih Tanggal</label>
          <div className="input-icon-wrapper" onClick={handleDateClick} style={{ position: 'relative', cursor: 'pointer' }}>
            <Calendar style={{ color: 'var(--text-main)', opacity: 0.9, zIndex: 1 }} />
            <div className="form-control" style={{ 
              display: 'flex', 
              alignItems: 'center',
              height: '42px',
              pointerEvents: 'none'
            }}>
              <span style={{ fontWeight: 500 }}>
                {(() => {
                  if (!date) return "Pilih Tanggal";
                  const [y, m, d] = date.split('-');
                  return `${d}/${m}/${y}`;
                })()}
              </span>
            </div>
            <input
              type="date"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 2
              }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Pilih Jam</span>
            {isLoadingSlots && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'none' }}>Memeriksa slot...</span>}
          </label>
          
          <div className="slots-container">
            {TIME_SLOTS.map((slot, idx) => {
              const bookedInfo = bookedSlots.find(s => s.time === slot);
              const isSelected = selectedTime === slot;
              const isPast = isSlotPast(date, slot);
              const queueNo = idx + 1;
              
              return (
                <button
                  key={slot}
                  type="button"
                  className={`slot-btn ${isSelected ? 'selected' : ''} ${bookedInfo ? 'booked' : ''} ${isPast ? 'past' : ''}`}
                  disabled={!!bookedInfo || isSubmitting || isLoadingSlots || isPast}
                  onClick={() => setSelectedTime(slot)}
                  title={isPast ? 'Waktu sudah lewat' : bookedInfo ? `Dipesan oleh ${bookedInfo.name} (Antrean No. ${queueNo})` : `Pilih Antrean No. ${queueNo}`}
                >
                  <span className="slot-time">{slot}</span>
                  {isPast ? (
                    <span className="slot-status" style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: '0.15rem', fontWeight: 500 }}>No. {queueNo}</span>
                  ) : bookedInfo ? (
                    <span className="slot-owner" style={{ fontSize: '0.65rem', color: 'var(--primary)', marginTop: '0.15rem', fontWeight: 600, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bookedInfo.name} (#{queueNo})
                    </span>
                  ) : (
                    <span className="slot-status" style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.15rem', fontWeight: 500 }}>No. {queueNo}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <button
            type="submit"
            className="btn"
            disabled={isSubmitting || isLoadingSlots || !isEnvConfigured}
          >
            {isSubmitting ? 'Memproses Booking...' : 'Booking Sekarang'}
          </button>
        </div>
      </form>

      {/* Mobile-only shortcut to check status */}
      <div className="show-on-mobile-only" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <Link 
          href="/booking-status" 
          style={{ 
            fontSize: '0.85rem', 
            color: 'var(--primary)', 
            textDecoration: 'underline', 
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <Clock size={14} /> Cek & Reschedule Booking
        </Link>
      </div>
    </div>
  );
}

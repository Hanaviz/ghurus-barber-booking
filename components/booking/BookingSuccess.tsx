"use client";

import Link from 'next/link';

interface BookingSuccessProps {
  successData: { date: string; time: string };
  handleResetForm: () => void;
  formatDateIndo: (dateStr: string) => string;
}

export default function BookingSuccess({
  successData,
  handleResetForm,
  formatDateIndo
}: BookingSuccessProps) {
  return (
    <div className="card success-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', animation: 'zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      <div className="success-checkmark-container" style={{ marginBottom: '1.5rem' }}>
        <svg className="checkmark-svg" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>
      
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Booking Berhasil!
      </h2>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
        Jadwal pangkas rambut Anda di <strong>Ghurus Barber Clinic</strong> telah berhasil disimpan. Silakan datang tepat waktu sesuai jadwal Anda.
      </p>

      <div style={{ 
        backgroundColor: 'var(--bg-tertiary)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-md)', 
        padding: '1.25rem 1.5rem', 
        maxWidth: '380px', 
        margin: '0 auto 2.5rem auto', 
        textAlign: 'left',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Tanggal Booking:</span> 
          <strong style={{ color: 'var(--text-main)' }}>{formatDateIndo(successData.date)}</strong>
        </div>
        <div style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Jam Booking:</span> 
          <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{successData.time.replace(':', '.')} WIB</strong>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={handleResetForm}
          className="btn" 
          style={{ width: 'auto', padding: '0.75rem 2rem', fontWeight: 600 }}
        >
          Booking Baru
        </button>
        <Link 
          href="/booking-status"
          className="btn btn-secondary" 
          style={{ 
            width: 'auto', 
            padding: '0.75rem 2rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 600 
          }}
        >
          Cek Status Booking
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';
import { Ticket } from 'lucide-react';

interface BookingSuccessProps {
  successData: { date: string; queue_number: number; session: 'siang' | 'malam' };
  handleResetForm: () => void;
  formatDateIndo: (dateStr: string) => string;
}

export default function BookingSuccess({
  successData,
  handleResetForm,
  formatDateIndo
}: BookingSuccessProps) {
  const isMalam = successData.session === 'malam';
  const prefix = isMalam ? 'M-' : 'S-';
  const sessionColor = isMalam ? '#a78bfa' : '#f59e0b';
  const sessionBorder = isMalam ? '2px dashed #8b5cf6' : '2px dashed #f59e0b';

  return (
    <div className="card success-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', animation: 'zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      <div className="success-checkmark-container" style={{ marginBottom: '1.5rem' }}>
        <svg className="checkmark-svg" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>
      
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Antrean Diterima!
      </h2>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.75rem auto', lineHeight: '1.6' }}>
        Selamat anda berhasil mendapatkan tiket!. Ketuk <strong>Kelola Tiket Saya</strong> di bawah untuk  mengelola antrean Anda hari ini.
      </p>

      {/* Ticket Queue Card */}
      <div style={{ 
        backgroundColor: 'var(--bg-tertiary)', 
        border: sessionBorder, 
        borderRadius: 'var(--radius-md)', 
        padding: '1.5rem', 
        maxWidth: '320px', 
        margin: '0 auto 2.5rem auto', 
        textAlign: 'center',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ticket notch left */}
        <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }} />
        {/* Ticket notch right */}
        <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', borderLeft: '1px solid var(--border)' }} />

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
          <Ticket size={14} style={{ color: sessionColor }} />
          <span style={{ color: sessionColor, fontWeight: 700 }}>Tiket {isMalam ? 'Sesi Malam' : 'Sesi Siang'}</span>
        </div>

        <div style={{ fontSize: '3rem', fontWeight: 800, color: sessionColor, margin: '0.25rem 0', lineHeight: '1' }}>
          {prefix}{successData.queue_number}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.75rem', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Tanggal: <strong style={{ color: 'var(--text-main)' }}>{formatDateIndo(successData.date)}</strong>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
        <Link 
          href="/booking-status"
          className="btn" 
          style={{ 
            width: '100%',
            maxWidth: '320px',
            padding: '0.85rem 1.75rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700,
            backgroundColor: sessionColor,
            color: isMalam ? '#fff' : '#000',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          Kelola Tiket Saya
        </Link>
        <button 
          onClick={handleResetForm}
          style={{ 
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            transition: 'color 0.2s ease',
            padding: '0.25rem 0.5rem'
          }}
        >
          Pendaftaran Baru
        </button>
      </div>
    </div>
  );
}

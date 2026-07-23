"use client";

import React from 'react';
import Link from 'next/link';
import { User, Phone, AlertCircle, CheckCircle2, Ticket, Play, Users, CheckSquare, Search, Sun, Moon } from 'lucide-react';

interface QueueItem {
  name: string;
  queue_number: number;
  status: 'Menunggu' | 'Sedang Dicukur' | 'Selesai' | 'Batal';
  session: 'siang' | 'malam';
}

interface BookingFormProps {
  name: string;
  setName: (val: string) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  date: string;
  sesiAktif: 'semua' | 'siang' | 'malam' | 'tutup';
  session: 'siang' | 'malam';
  setSession: (val: 'siang' | 'malam') => void;
  siangBuka: string;
  siangMax: number;
  siangCurrent: number;
  siangCount: number;
  malamBuka: string;
  malamMax: number;
  malamCurrent: number;
  malamCount: number;
  todayBookings: QueueItem[];
  isLoadingSlots: boolean;
  isSubmitting: boolean;
  isEnvConfigured: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function BookingForm({
  name,
  setName,
  whatsapp,
  setWhatsapp,
  date,
  sesiAktif,
  session,
  setSession,
  siangBuka,
  siangMax,
  siangCurrent,
  siangCount,
  malamBuka,
  malamMax,
  malamCurrent,
  malamCount,
  todayBookings,
  isLoadingSlots,
  isSubmitting,
  isEnvConfigured,
  message,
  handleSubmit
}: BookingFormProps) {

  // Formatting date to Indonesian format (e.g. 17 Juli 2026)
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
  };

  const isClosed = sesiAktif === 'tutup';
  
  const currentHour = new Date().getHours();
  const isSiangExpired = currentHour >= 18;
  const isMalamExpired = currentHour >= 23 || currentHour < 6;

  const selectedMax = session === 'siang' ? siangMax : malamMax;
  const selectedCount = session === 'siang' ? siangCount : malamCount;
  const isSelectedExpired = session === 'siang' ? isSiangExpired : isMalamExpired;
  const isSelectedFull = selectedCount >= selectedMax || isSelectedExpired;

  const siangBookings = todayBookings.filter(b => b.session === 'siang');
  const malamBookings = todayBookings.filter(b => b.session === 'malam');

  return (
    <div className="card" style={{ animation: 'slideUp 0.35s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          padding: '1rem', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(197, 168, 128, 0.1)', 
          color: 'var(--primary)',
          marginBottom: '0.75rem'
        }}>
          <Ticket size={32} />
        </div>
        <h1 className="card-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pendaftaran Antrean</h1>
        <p className="card-subtitle" style={{ fontSize: '0.9rem' }}>
          Ambil tiket antrean pangkas rambut Anda untuk **Hari Ini** ({formatDateIndo(date)})
        </p>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div>{message.text}</div>
        </div>
      )}
      
      {isClosed ? (
        <div className="alert alert-error" style={{ 
          padding: '1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center', 
          gap: '0.35rem',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.5rem'
        }}>
          <AlertCircle size={24} style={{ color: 'var(--danger)' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Pendaftaran Tutup</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
            Maaf, pendaftaran antrean baru hari ini sudah ditutup.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          
          {/* Sesi Selector Cards (Unified Session Info & Selector UI) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <label className="form-label">Pilih Sesi Mencukur</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: (sesiAktif === 'siang' || sesiAktif === 'malam') ? '1fr' : '1fr 1fr', 
              gap: '0.75rem' 
            }} className="grid-responsive-2">
              
              {/* Sesi Siang Card option */}
              {(sesiAktif === 'semua' || sesiAktif === 'siang') && (
                <div 
                  onClick={() => { if (sesiAktif === 'semua' && !isSiangExpired && siangCount < siangMax) setSession('siang'); }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: session === 'siang' ? '2px solid #f59e0b' : '1px solid var(--border)',
                    backgroundColor: session === 'siang' ? 'rgba(245, 158, 11, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: (sesiAktif === 'semua' && !isSiangExpired && siangCount < siangMax) ? 'pointer' : 'not-allowed',
                    opacity: (siangCount >= siangMax || isSiangExpired) ? 0.55 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: session === 'siang' ? '#f59e0b' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sun size={16} /> Siang
                    </span>
                    {isSiangExpired ? (
                      <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>Tutup</span>
                    ) : siangCount >= siangMax ? (
                      <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>Penuh</span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>Buka</span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.15rem' }}>
                    <div>Mulai: <strong>{siangBuka.replace(':', '.')} WIB</strong></div>
                    <div>Dicukur: <strong style={{ color: '#f59e0b' }}>S-{siangCurrent}</strong></div>
                    <div>Sisa Kuota: <strong>{isSiangExpired ? '0' : Math.max(0, siangMax - siangCount)} Slot</strong> <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>({siangCount}/{siangMax})</span></div>
                  </div>
                </div>
              )}

              {/* Sesi Malam Card option */}
              {(sesiAktif === 'semua' || sesiAktif === 'malam') && (
                <div 
                  onClick={() => { if (sesiAktif === 'semua' && !isMalamExpired && malamCount < malamMax) setSession('malam'); }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: session === 'malam' ? '2px solid #8b5cf6' : '1px solid var(--border)',
                    backgroundColor: session === 'malam' ? 'rgba(139, 92, 246, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: (sesiAktif === 'semua' && !isMalamExpired && malamCount < malamMax) ? 'pointer' : 'not-allowed',
                    opacity: (malamCount >= malamMax || isMalamExpired) ? 0.55 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: session === 'malam' ? '#a78bfa' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Moon size={16} /> Malam
                    </span>
                    {isMalamExpired ? (
                      <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>Tutup</span>
                    ) : malamCount >= malamMax ? (
                      <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>Penuh</span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>Buka</span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.15rem' }}>
                    <div>Mulai: <strong>{malamBuka.replace(':', '.')} WIB</strong></div>
                    <div>Dicukur: <strong style={{ color: '#a78bfa' }}>M-{malamCurrent}</strong></div>
                    <div>Sisa Kuota: <strong>{isMalamExpired ? '0' : Math.max(0, malamMax - malamCount)} Slot</strong> <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>({malamCount}/{malamMax})</span></div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="name">Nama Lengkap</label>
            <div className="input-icon-wrapper">
              <User size={18} />
              <input 
                id="name"
                type="text" 
                className="form-control" 
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting || isLoadingSlots || !isEnvConfigured || isSelectedFull}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="whatsapp">Nomor WhatsApp</label>
            <div className="input-icon-wrapper">
              <Phone size={18} />
              <input 
                id="whatsapp"
                type="tel" 
                className="form-control" 
                placeholder="Contoh: 08123456789"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                disabled={isSubmitting || isLoadingSlots || !isEnvConfigured || isSelectedFull}
                required
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Nomor WhatsApp digunakan untuk melacak status dan perkiraan giliran antrean Anda.
            </p>
          </div>



          {isSelectedFull ? (
            <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              Kuota Sesi {session === 'siang' ? 'Siang' : 'Malam'} sudah penuh hari ini. Silakan pilih sesi lainnya jika tersedia.
            </div>
          ) : (
            <button 
              type="submit" 
              className="btn" 
              style={{ 
                fontWeight: 700, 
                backgroundColor: session === 'malam' ? '#8b5cf6' : '#f59e0b',
                color: session === 'malam' ? '#fff' : '#000'
              }}
              disabled={isSubmitting || isLoadingSlots || !isEnvConfigured}
            >
              {isSubmitting ? 'Mengambil Tiket...' : 'Ambil Tiket Antrean'}
            </button>
          )}
        </form>
      )}

      {/* Today's Queue List Section (Grouped by Session) */}
      {todayBookings.length > 0 && (
        <div style={{ 
          marginTop: '1.75rem', 
          paddingTop: '1.25rem', 
          borderTop: '1px solid var(--border)',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            fontSize: '0.9rem', 
            color: 'var(--primary)', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Users size={16} /> Urutan Antrean Hari Ini
          </h3>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            maxHeight: '260px',
            overflowY: 'auto',
            paddingRight: '0.25rem'
          }} className="custom-scrollbar">
            
            {/* Urutan Sesi Siang */}
            {siangBookings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingBottom: '0.15rem', borderBottom: '1px solid rgba(245, 158, 11, 0.1)' }}>
                  <Sun size={12} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sesi Siang</span>
                </div>
                {siangBookings.map((b) => {
                  const isProcess = b.status === 'Sedang Dicukur';
                  const isCurrent = isProcess || (b.queue_number === siangCurrent && b.status === 'Menunggu');
                  const isDone = b.status === 'Selesai';
                  const isCancel = b.status === 'Batal';
                  
                  return (
                    <div 
                      key={'siang-' + b.queue_number} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCurrent ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.015)',
                        border: isCurrent 
                          ? '1px solid rgba(245, 158, 11, 0.4)' 
                          : '1px solid var(--border)',
                        opacity: isDone || isCancel ? 0.45 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          backgroundColor: isCurrent ? '#f59e0b' : isDone ? 'rgba(255,255,255,0.05)' : 'rgba(245, 158, 11, 0.08)',
                          color: isCurrent ? '#000' : isDone ? 'var(--text-muted)' : '#f59e0b',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          minWidth: '45px',
                          textAlign: 'center',
                          border: isCurrent ? 'none' : '1px solid rgba(245, 158, 11, 0.15)'
                        }}>
                          S-{b.queue_number}
                        </span>
                        <span style={{ 
                          fontWeight: 600, 
                          fontSize: '0.85rem',
                          textDecoration: isDone || isCancel ? 'line-through' : 'none',
                          color: isDone || isCancel ? 'var(--text-muted)' : 'var(--text-main)'
                        }}>
                          {b.name}
                        </span>
                      </div>
                      <div>
                        {isCurrent ? (
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            color: '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            animation: 'pulse 1.5s infinite'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                            Sedang Dicukur
                          </span>
                        ) : isDone ? (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Selesai</span>
                        ) : isCancel ? (
                          <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 500 }}>Batal</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 500 }}>Menunggu</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Urutan Sesi Malam */}
            {malamBookings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: siangBookings.length > 0 ? '0.5rem' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingBottom: '0.15rem', borderBottom: '1px solid rgba(139, 92, 246, 0.1)' }}>
                  <Moon size={12} style={{ color: '#a78bfa' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sesi Malam</span>
                </div>
                {malamBookings.map((b) => {
                  const isProcess = b.status === 'Sedang Dicukur';
                  const isCurrent = isProcess || (b.queue_number === malamCurrent && b.status === 'Menunggu');
                  const isDone = b.status === 'Selesai';
                  const isCancel = b.status === 'Batal';
                  
                  return (
                    <div 
                      key={'malam-' + b.queue_number} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCurrent ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.015)',
                        border: isCurrent 
                          ? '1px solid rgba(139, 92, 246, 0.4)' 
                          : '1px solid var(--border)',
                        opacity: isDone || isCancel ? 0.45 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          backgroundColor: isCurrent ? '#8b5cf6' : isDone ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.08)',
                          color: isCurrent ? '#fff' : isDone ? 'var(--text-muted)' : '#a78bfa',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          minWidth: '45px',
                          textAlign: 'center',
                          border: isCurrent ? 'none' : '1px solid rgba(139, 92, 246, 0.15)'
                        }}>
                          M-{b.queue_number}
                        </span>
                        <span style={{ 
                          fontWeight: 600, 
                          fontSize: '0.85rem',
                          textDecoration: isDone || isCancel ? 'line-through' : 'none',
                          color: isDone || isCancel ? 'var(--text-muted)' : 'var(--text-main)'
                        }}>
                          {b.name}
                        </span>
                      </div>
                      <div>
                        {isCurrent ? (
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            color: '#a78bfa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            animation: 'pulse 1.5s infinite'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a78bfa' }} />
                            Sedang Dicukur
                          </span>
                        ) : isDone ? (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Selesai</span>
                        ) : isCancel ? (
                          <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 500 }}>Batal</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 500 }}>Menunggu</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Floating search tracker link */}
      <div style={{ 
        marginTop: '1.25rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Link 
          href="/booking-status"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            color: 'var(--primary)', 
            fontWeight: 600,
            fontSize: '0.85rem',
            textDecoration: 'none'
          }}
        >
          <Search size={14} /> Kelola Tiket Saya
        </Link>
      </div>
    </div>
  );
}

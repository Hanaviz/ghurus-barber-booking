"use client";

import React from 'react';
import { X, User, Phone, Ticket } from 'lucide-react';

interface ManualBookingModalProps {
  manualName: string;
  setManualName: (val: string) => void;
  manualWhatsapp: string;
  setManualWhatsapp: (val: string) => void;
  manualSession: 'siang' | 'malam';
  setManualSession: (val: 'siang' | 'malam') => void;
  isSavingManual: boolean;
  handleAddManualBooking: (e: React.FormEvent) => void;
  closeModal: () => void;
  sesiAktif: 'semua' | 'siang' | 'malam' | 'tutup';
  siangCount: number;
  malamCount: number;
  siangMax: number;
  malamMax: number;
}

export default function ManualBookingModal({
  manualName,
  setManualName,
  manualWhatsapp,
  setManualWhatsapp,
  manualSession,
  setManualSession,
  isSavingManual,
  handleAddManualBooking,
  closeModal,
  sesiAktif,
  siangCount,
  malamCount,
  siangMax,
  malamMax
}: ManualBookingModalProps) {
  const selectedMax = manualSession === 'siang' ? siangMax : malamMax;
  const selectedCount = manualSession === 'siang' ? siangCount : malamCount;
  const isFull = selectedCount >= selectedMax;

  const isClosed = sesiAktif === 'tutup';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Booking Manual (Walk-in)</h3>
          <button className="modal-close" onClick={closeModal} type="button">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleAddManualBooking}>
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Masukkan data pelanggan walk-in yang datang langsung ke toko untuk didaftarkan ke antrean sesi aktif hari ini.
            </p>

            {/* Live Queue Info Card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Sesi Booking</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'capitalize' }}>
                  Sesi {manualSession === 'siang' ? '☀️ Siang' : '🌙 Malam'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Kuota Terisi</span>
                <strong style={{ fontSize: '0.9rem', color: isFull ? 'var(--danger)' : 'var(--text-main)' }}>
                  {selectedCount} / {selectedMax} Antrean
                </strong>
              </div>
            </div>

            {isClosed ? (
              <div className="alert alert-error" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Pendaftaran antrean sedang ditutup oleh owner. Silakan aktifkan status sesi aktif terlebih dahulu di toolbar.
              </div>
            ) : isFull ? (
              <div className="alert alert-error" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Kuota antrean Sesi {manualSession === 'siang' ? 'Siang' : 'Malam'} hari ini sudah penuh ({selectedMax} orang).
              </div>
            ) : null}

            {/* Session selector (only when both sessions are active) */}
            {sesiAktif === 'semua' && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Pilih Sesi Booking</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ 
                      flex: 1, 
                      height: '36px', 
                      fontSize: '0.8rem', 
                      padding: 0,
                      backgroundColor: manualSession === 'siang' ? '#f59e0b' : 'rgba(255,255,255,0.02)',
                      color: manualSession === 'siang' ? '#000' : 'var(--text-muted)',
                      border: manualSession === 'siang' ? 'none' : '1px solid var(--border)',
                      fontWeight: 700
                    }}
                    onClick={() => setManualSession('siang')}
                    disabled={isSavingManual}
                  >
                    ☀️ Sesi Siang
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ 
                      flex: 1, 
                      height: '36px', 
                      fontSize: '0.8rem', 
                      padding: 0,
                      backgroundColor: manualSession === 'malam' ? '#8b5cf6' : 'rgba(255,255,255,0.02)',
                      color: manualSession === 'malam' ? '#fff' : 'var(--text-muted)',
                      border: manualSession === 'malam' ? 'none' : '1px solid var(--border)',
                      fontWeight: 700
                    }}
                    onClick={() => setManualSession('malam')}
                    disabled={isSavingManual}
                  >
                    🌙 Sesi Malam
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="manualName">Nama Pelanggan</label>
              <div className="input-icon-wrapper">
                <User size={18} />
                <input
                  id="manualName"
                  type="text"
                  className="form-control"
                  placeholder="Masukkan nama lengkap"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  disabled={isSavingManual || isClosed || isFull}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="manualWhatsapp">Nomor WhatsApp</label>
              <div className="input-icon-wrapper">
                <Phone size={18} />
                <input
                  id="manualWhatsapp"
                  type="tel"
                  className="form-control"
                  placeholder="Contoh: 08123456789"
                  value={manualWhatsapp}
                  onChange={(e) => setManualWhatsapp(e.target.value)}
                  disabled={isSavingManual || isClosed || isFull}
                  required
                />
              </div>
            </div>

            {!isClosed && !isFull && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: 'rgba(197, 168, 128, 0.05)', 
                border: '1px dashed var(--primary)', 
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--primary)'
              }}>
                <Ticket size={16} />
                <span>Pelanggan ini akan mendapatkan tiket antrean **{manualSession === 'siang' ? 'S-' : 'M-'}{selectedCount + 1}**</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: 'auto', padding: '0.65rem 1.25rem' }}
              onClick={closeModal}
              disabled={isSavingManual}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn" 
              style={{ width: 'auto', padding: '0.65rem 1.25rem' }}
              disabled={isSavingManual || isClosed || isFull}
            >
              {isSavingManual ? 'Mendaftarkan...' : 'Daftarkan Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

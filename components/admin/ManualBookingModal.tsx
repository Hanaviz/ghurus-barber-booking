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
      <div className="modal-content" style={{ maxWidth: '420px', padding: '1.25rem' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <h3 className="modal-title" style={{ fontSize: '1.15rem', fontWeight: 800 }}>Booking Manual (Walk-in)</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Sesi {manualSession === 'siang' ? '☀️ Siang' : '🌙 Malam'} — Kuota: <strong style={{ color: isFull ? 'var(--danger)' : 'var(--text-main)' }}>{selectedCount}/{selectedMax}</strong>
            </span>
          </div>
          <button className="modal-close" onClick={closeModal} type="button" style={{ top: '1.25rem', right: '1.25rem' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleAddManualBooking}>
          <div className="modal-body" style={{ padding: 0 }}>
            
            {isClosed ? (
              <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                Pendaftaran ditutup. Silakan aktifkan sesi di toolbar.
              </div>
            ) : isFull ? (
              <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                Kuota antrean Sesi {manualSession === 'siang' ? 'Siang' : 'Malam'} hari ini sudah penuh.
              </div>
            ) : null}

            {/* Session selector (only when both sessions are active) */}
            {sesiAktif === 'semua' && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Pilih Sesi Booking</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ 
                      flex: 1, 
                      height: '34px', 
                      fontSize: '0.75rem', 
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
                      height: '34px', 
                      fontSize: '0.75rem', 
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

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="manualName" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Nama Pelanggan</label>
              <div className="input-icon-wrapper">
                <User size={16} />
                <input
                  id="manualName"
                  type="text"
                  className="form-control"
                  placeholder="Masukkan nama lengkap"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  disabled={isSavingManual || isClosed || isFull}
                  required
                  style={{ height: '36px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="manualWhatsapp" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Nomor WhatsApp</label>
              <div className="input-icon-wrapper">
                <Phone size={16} />
                <input
                  id="manualWhatsapp"
                  type="tel"
                  className="form-control"
                  placeholder="Contoh: 08123456789"
                  value={manualWhatsapp}
                  onChange={(e) => setManualWhatsapp(e.target.value)}
                  disabled={isSavingManual || isClosed || isFull}
                  required
                  style={{ height: '36px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: '0.25rem' }}>
            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', height: '40px', fontSize: '0.85rem', fontWeight: 700 }}
              disabled={isSavingManual || isClosed || isFull}
            >
              Daftarkan Pelanggan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

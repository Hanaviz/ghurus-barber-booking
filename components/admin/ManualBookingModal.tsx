"use client";

import React from 'react';
import { Calendar, X } from 'lucide-react';

interface BookedSlot {
  time: string;
  name: string;
}

interface ManualBookingModalProps {
  manualName: string;
  setManualName: (val: string) => void;
  manualWhatsapp: string;
  setManualWhatsapp: (val: string) => void;
  manualDate: string;
  setManualDate: (val: string) => void;
  manualTime: string;
  setManualTime: (val: string) => void;
  manualBookedSlots: BookedSlot[];
  isLoadingManualSlots: boolean;
  isSavingManual: boolean;
  TIME_SLOTS: string[];
  handleDateClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isSlotPast: (dateStr: string, timeStr: string) => boolean;
  handleAddManualBooking: (e: React.FormEvent) => void;
  closeModal: () => void;
}

export default function ManualBookingModal({
  manualName,
  setManualName,
  manualWhatsapp,
  setManualWhatsapp,
  manualDate,
  setManualDate,
  manualTime,
  setManualTime,
  manualBookedSlots,
  isLoadingManualSlots,
  isSavingManual,
  TIME_SLOTS,
  handleDateClick,
  isSlotPast,
  handleAddManualBooking,
  closeModal
}: ManualBookingModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Booking Manual (Walk-in)</h3>
          <button className="modal-close" onClick={closeModal}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleAddManualBooking}>
          <div className="modal-body">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Gunakan form ini jika pelanggan mendaftar langsung di tempat pangkas rambut.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive-2">
              <div className="form-group">
                <label className="form-label">Nama Pelanggan</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Budi..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                  disabled={isSavingManual}
                />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Pelanggan</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Contoh: 0812..."
                  value={manualWhatsapp}
                  onChange={(e) => setManualWhatsapp(e.target.value)}
                  required
                  disabled={isSavingManual}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Booking</label>
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
                      if (!manualDate) return "Pilih Tanggal Booking";
                      const [y, m, d] = manualDate.split('-');
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
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Pilih Slot Jam</span>
                {isLoadingManualSlots && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memeriksa slot...</span>}
              </label>
              
              <div className="slots-container">
                {TIME_SLOTS.map((slot, idx) => {
                  const bookedInfo = manualBookedSlots.find(s => s.time === slot);
                  const isSelected = manualTime === slot;
                  const isPast = isSlotPast(manualDate, slot);
                  const queueNo = idx + 1;
                  
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-btn ${isSelected ? 'selected' : ''} ${bookedInfo ? 'booked' : ''} ${isPast ? 'past' : ''}`}
                      disabled={!!bookedInfo || isLoadingManualSlots || isPast}
                      onClick={() => setManualTime(slot)}
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
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
              onClick={closeModal}
              disabled={isSavingManual}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn" 
              style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
              disabled={isSavingManual || isLoadingManualSlots || !manualTime}
            >
              {isSavingManual ? 'Menyimpan...' : 'Tambah Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { Calendar, Clock, X } from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  status: 'Menunggu' | 'Selesai' | 'Batal';
  created_at: string;
}

interface BookedSlot {
  time: string;
  name: string;
}

interface RescheduleModalProps {
  activeReschedule: Booking;
  newDate: string;
  setNewDate: (val: string) => void;
  newTime: string;
  setNewTime: (val: string) => void;
  bookedSlots: BookedSlot[];
  isLoadingSlots: boolean;
  isSavingReschedule: boolean;
  TIME_SLOTS: string[];
  handleDateClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isSlotPast: (dateStr: string, timeStr: string) => boolean;
  handleSaveReschedule: () => void;
  closeModal: () => void;
  getTodayString: () => string;
}

export default function RescheduleModal({
  activeReschedule,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  bookedSlots,
  isLoadingSlots,
  isSavingReschedule,
  TIME_SLOTS,
  handleDateClick,
  isSlotPast,
  handleSaveReschedule,
  closeModal,
  getTodayString
}: RescheduleModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Ubah Jadwal Booking</h3>
          <button className="modal-close" onClick={closeModal}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Reschedule untuk <strong>{activeReschedule.name}</strong> ({activeReschedule.whatsapp})
          </p>

          <div className="form-group">
            <label className="form-label">Pilih Tanggal Baru</label>
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
                    if (!newDate) return "Pilih Tanggal Baru";
                    const [y, m, d] = newDate.split('-');
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
                value={newDate}
                min={getTodayString()}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Pilih Jam Baru</span>
              {isLoadingSlots && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'none' }}>Memeriksa slot...</span>}
            </label>
            
             <div className="slots-container">
               {TIME_SLOTS.map((slot, idx) => {
                const bookedInfo = bookedSlots.find(s => s.time === slot);
                const isCurrentTime = activeReschedule.booking_date === newDate && activeReschedule.booking_time.substring(0, 5) === slot;
                const isPast = isSlotPast(newDate, slot);
                const isSelected = newTime === slot;
                const queueNo = idx + 1;
                
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-btn ${isSelected ? 'selected' : ''} ${bookedInfo ? 'booked' : ''} ${isPast ? 'past' : ''}`}
                    disabled={!!bookedInfo || isLoadingSlots || isPast}
                    onClick={() => setNewTime(slot)}
                    style={isCurrentTime ? { borderColor: 'rgba(197, 168, 128, 0.7)', borderStyle: 'dashed' } : {}}
                    title={isCurrentTime ? 'Jadwal Anda saat ini' : isPast ? 'Waktu sudah lewat' : bookedInfo ? `Dipesan oleh ${bookedInfo.name} (Antrean No. ${queueNo})` : `Pilih Antrean No. ${queueNo}`}
                  >
                    <span className="slot-time">{slot} {isCurrentTime && '*'}</span>
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
            {activeReschedule.booking_date === newDate && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                * Tanda bintang menunjukkan jadwal Anda saat ini.
              </span>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            onClick={closeModal}
            disabled={isSavingReschedule}
          >
            Kembali
          </button>
          <button 
            type="button" 
            className="btn" 
            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            onClick={handleSaveReschedule}
            disabled={isSavingReschedule || isLoadingSlots || !newTime}
          >
            {isSavingReschedule ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </div>
    </div>
  );
}

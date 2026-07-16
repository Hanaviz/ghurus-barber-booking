"use client";

import React from 'react';
import { Calendar, Plus } from 'lucide-react';

interface ToolbarProps {
  filterDate: string;
  setFilterDate: (val: string) => void;
  handleDateClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  openManualBookingModal: () => void;
}

export default function Toolbar({
  filterDate,
  setFilterDate,
  handleDateClick,
  openManualBookingModal
}: ToolbarProps) {
  return (
    <div className="admin-toolbar">
      <div className="toolbar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} style={{ color: 'var(--text-main)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter Tanggal:</span>
        </div>
        <div onClick={handleDateClick} style={{ position: 'relative', width: '160px', cursor: 'pointer' }}>
          <div className="form-control" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0.5rem 1rem',
            height: '38px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
              {(() => {
                if (!filterDate) return "Pilih Tanggal";
                const [y, m, d] = filterDate.split('-');
                return `${d}/${m}/${y}`;
              })()}
            </span>
            <Calendar size={14} style={{ color: 'var(--text-main)', opacity: 0.8 }} />
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
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>
      <div className="toolbar-right">
        <button className="btn" style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }} onClick={openManualBookingModal}>
          <Plus size={16} /> Booking Manual (Walk-in)
        </button>
      </div>
    </div>
  );
}

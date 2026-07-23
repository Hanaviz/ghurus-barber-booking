"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Save, Sun, Moon, Edit2 } from 'lucide-react';

interface ToolbarProps {
  filterDate: string;
  sesiAktif: 'semua' | 'siang' | 'malam' | 'tutup';
  siangBuka: string;
  siangMax: number;
  malamBuka: string;
  malamMax: number;
  isSavingStatus: boolean;
  handleUpdateDayStatus: (
    sesiAktifVal: 'semua' | 'siang' | 'malam' | 'tutup',
    siangBukaVal: string,
    siangMaxVal: number,
    malamBukaVal: string,
    malamMaxVal: number
  ) => Promise<void>;
  openManualBookingModal: () => void;
}

export default function Toolbar({
  filterDate,
  sesiAktif,
  siangBuka,
  siangMax,
  malamBuka,
  malamMax,
  isSavingStatus,
  handleUpdateDayStatus,
  openManualBookingModal
}: ToolbarProps) {
  const [localSesiAktif, setLocalSesiAktif] = useState<'semua' | 'siang' | 'malam' | 'tutup'>(sesiAktif);
  const [localSiangBuka, setLocalSiangBuka] = useState(siangBuka);
  const [localSiangMax, setLocalSiangMax] = useState(siangMax);
  const [localMalamBuka, setLocalMalamBuka] = useState(malamBuka);
  const [localMalamMax, setLocalMalamMax] = useState(malamMax);
  
  // State mode edit (default terkunci/false)
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalSesiAktif(sesiAktif);
    setLocalSiangBuka(siangBuka);
    setLocalSiangMax(siangMax);
    setLocalMalamBuka(malamBuka);
    setLocalMalamMax(malamMax);
  }, [sesiAktif, siangBuka, siangMax, malamBuka, malamMax]);

  const handleSave = () => {
    handleUpdateDayStatus(
      localSesiAktif,
      localSiangBuka,
      localSiangMax,
      localMalamBuka,
      localMalamMax
    );
  };

  const isSiangActive = localSesiAktif === 'semua' || localSesiAktif === 'siang';
  const isMalamActive = localSesiAktif === 'semua' || localSesiAktif === 'malam';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
      
      {/* 1. Pengaturan Operasional Card */}
      <div className="admin-toolbar-card">
        
        {/* Header Title Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '0.5rem', 
          borderBottom: '1px solid rgba(255,255,255,0.05)', 
          paddingBottom: '0.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h4 style={{ 
              fontSize: '0.85rem', 
              color: 'var(--primary)', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              margin: 0 
            }}>
              Pengaturan Operasional
            </h4>
            <span style={{ 
              fontSize: '0.72rem', 
              color: 'var(--text-muted)', 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              padding: '0.15rem 0.45rem', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border)',
              fontWeight: 600
            }}>
              {(() => {
                if (!filterDate) return "";
                const [y, m, d] = filterDate.split('-');
                return `${d}/${m}/${y}`;
              })()}
            </span>
          </div>
        </div>

        {/* Single Horizontal Line: Session Controls & Edit/Save Icon Button */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: '0.75rem', 
          flexWrap: 'wrap', 
          marginTop: '0.15rem' 
        }}>
          
          {/* Left Controls Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* Status Sesi Aktif Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Sesi Hari Ini:
              </label>
              <select 
                className="form-control" 
                style={{ 
                  height: '32px', 
                  width: 'auto', 
                  padding: '0 0.5rem', 
                  fontSize: '0.78rem', 
                  backgroundColor: isEditing ? 'var(--bg-tertiary)' : 'rgba(255, 255, 255, 0.02)', 
                  borderColor: isEditing ? 'var(--primary)' : 'var(--border)',
                  fontWeight: 700,
                  opacity: isEditing ? 1 : 0.8
                }}
                value={localSesiAktif}
                onChange={(e) => setLocalSesiAktif(e.target.value as any)}
                disabled={!isEditing || isSavingStatus}
              >
                <option value="semua">⚡ Semua Sesi (Siang & Malam)</option>
                <option value="siang">☀️ Sesi Siang Saja</option>
                <option value="malam">🌙 Sesi Malam Saja</option>
                <option value="tutup">🔴 Tutup Antrean Harian</option>
              </select>
            </div>

            {/* Sesi Siang Compact Strip */}
            {isSiangActive && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                backgroundColor: 'rgba(245, 158, 11, 0.03)',
                border: '1px solid ' + (isEditing ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.15)'),
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sun size={14} style={{ color: '#f59e0b' }} />
                  <strong style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase' }}>Siang</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Buka</span>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ 
                        height: '26px', 
                        width: '55px', 
                        fontSize: '0.78rem', 
                        padding: '0 0.15rem', 
                        textAlign: 'center', 
                        fontWeight: 700,
                        backgroundColor: isEditing ? 'var(--bg-tertiary)' : 'transparent',
                        borderColor: isEditing ? 'rgba(245, 158, 11, 0.5)' : 'transparent'
                      }} 
                      value={localSiangBuka} 
                      onChange={(e) => setLocalSiangBuka(e.target.value)} 
                      placeholder="14:00"
                      disabled={!isEditing}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Kuota</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ 
                        height: '26px', 
                        width: '45px', 
                        fontSize: '0.78rem', 
                        padding: '0 0.15rem', 
                        textAlign: 'center', 
                        fontWeight: 700,
                        backgroundColor: isEditing ? 'var(--bg-tertiary)' : 'transparent',
                        borderColor: isEditing ? 'rgba(245, 158, 11, 0.5)' : 'transparent'
                      }} 
                      value={localSiangMax} 
                      onChange={(e) => setLocalSiangMax(parseInt(e.target.value) || 0)} 
                      min={1}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sesi Malam Compact Strip */}
            {isMalamActive && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                backgroundColor: 'rgba(139, 92, 246, 0.03)',
                border: '1px solid ' + (isEditing ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.15)'),
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Moon size={14} style={{ color: '#8b5cf6' }} />
                  <strong style={{ fontSize: '0.75rem', color: '#a78bfa', textTransform: 'uppercase' }}>Malam</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Buka</span>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ 
                        height: '26px', 
                        width: '55px', 
                        fontSize: '0.78rem', 
                        padding: '0 0.15rem', 
                        textAlign: 'center', 
                        fontWeight: 700,
                        backgroundColor: isEditing ? 'var(--bg-tertiary)' : 'transparent',
                        borderColor: isEditing ? 'rgba(139, 92, 246, 0.5)' : 'transparent'
                      }} 
                      value={localMalamBuka} 
                      onChange={(e) => setLocalMalamBuka(e.target.value)} 
                      placeholder="20:00"
                      disabled={!isEditing}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Kuota</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ 
                        height: '26px', 
                        width: '45px', 
                        fontSize: '0.78rem', 
                        padding: '0 0.15rem', 
                        textAlign: 'center', 
                        fontWeight: 700,
                        backgroundColor: isEditing ? 'var(--bg-tertiary)' : 'transparent',
                        borderColor: isEditing ? 'rgba(139, 92, 246, 0.5)' : 'transparent'
                      }} 
                      value={localMalamMax} 
                      onChange={(e) => setLocalMalamMax(parseInt(e.target.value) || 0)} 
                      min={1}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right End: Icon + Text Button for Edit / Save Toggle */}
          <div>
            {!isEditing ? (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsEditing(true)} 
                title="Ubah Pengaturan Operasional"
                style={{ 
                  height: '32px', 
                  padding: '0 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Edit2 size={13} /> Edit
              </button>
            ) : (
              <button 
                type="button" 
                className="btn" 
                onClick={() => { 
                  handleSave(); 
                  setIsEditing(false); 
                }} 
                title="Simpan Pengaturan Operasional"
                style={{ 
                  height: '32px', 
                  padding: '0 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap'
                }}
                disabled={isSavingStatus}
              >
                <Save size={13} /> Simpan
              </button>
            )}
          </div>

        </div>

      </div>

      {/* 2. Compact Standalone Booking Manual (Walk-in) Button (Aligned Right) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-secondary" 
          style={{ 
            width: 'auto',
            height: '34px', 
            padding: '0 1.25rem', 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            borderStyle: 'dashed', 
            borderColor: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
            borderRadius: 'var(--radius-md)'
          }} 
          onClick={openManualBookingModal}
          type="button"
          disabled={localSesiAktif === 'tutup'}
        >
          <Plus size={14} /> Booking Manual (Walk-in)
        </button>
      </div>

    </div>
  );
}



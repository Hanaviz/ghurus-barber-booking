"use client";

import React from 'react';
import { Search, Phone, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatusSearchProps {
  whatsappQuery: string;
  setWhatsappQuery: (val: string) => void;
  isSearching: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  handleSearch: (e: React.FormEvent) => void;
}

export default function StatusSearch({
  whatsappQuery,
  setWhatsappQuery,
  isSearching,
  message,
  handleSearch
}: StatusSearchProps) {
  return (
    <div className="card status-search-card">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          padding: '1rem', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(197, 168, 128, 0.1)', 
          color: 'var(--primary)',
          marginBottom: '1rem'
        }}>
          <Ticket size={32} />
        </div>
        <h1 className="card-title">Kelola Tiket Saya</h1>
        <p className="card-subtitle">Masukkan nomor WhatsApp Anda untuk mengelola tiket booking dan riwayat antrean Anda</p>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div>{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <div className="input-icon-wrapper">
            <Phone />
            <input
              type="tel"
              className="form-control"
              placeholder="Masukkan nomor WhatsApp saat booking..."
              value={whatsappQuery}
              onChange={(e) => setWhatsappQuery(e.target.value)}
              required
              disabled={isSearching}
            />
          </div>
        </div>
        <button type="submit" className="btn" style={{ width: 'auto', padding: '0 1.5rem' }} disabled={isSearching}>
          {isSearching ? 'Mencari...' : <Search size={20} />}
        </button>
      </form>
    </div>
  );
}

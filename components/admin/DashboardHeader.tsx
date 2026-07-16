"use client";

import React from 'react';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  handleLogout: () => void;
}

export default function DashboardHeader({ handleLogout }: DashboardHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>Dashboard Admin</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Atur jadwal pemesanan, konfirmasi, dan walk-in pelanggan</p>
      </div>
      <button className="btn btn-secondary hide-on-mobile" style={{ width: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={handleLogout}>
        <LogOut size={16} /> Keluar
      </button>
    </div>
  );
}

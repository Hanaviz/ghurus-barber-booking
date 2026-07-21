"use client";

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  password: string;
  setPassword: (val: string) => void;
  isLoggingIn: boolean;
  isEnvConfigured: boolean;
  handleLogin: (e: React.FormEvent) => void;
  error?: string | null;
}

export default function LoginForm({
  password,
  setPassword,
  isLoggingIn,
  isEnvConfigured,
  handleLogin,
  error
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', animation: 'fadeIn 0.5s ease' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(197, 168, 128, 0.1)', 
            color: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            <Lock size={32} />
          </div>
          <h1 className="card-title">Admin Portal</h1>
          <p className="card-subtitle">Silakan masukkan kata sandi untuk mengakses dashboard admin</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ 
            marginBottom: '1.25rem', 
            padding: '0.75rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoggingIn || !isEnvConfigured}
                style={{ letterSpacing: showPassword ? 'normal' : '0.1em', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem',
                  transition: 'color 0.2s ease'
                }}
                title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn" style={{ marginTop: '1.5rem' }} disabled={isLoggingIn || !isEnvConfigured}>
            {isLoggingIn ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

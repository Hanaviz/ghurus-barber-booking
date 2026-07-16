"use client";

import React from 'react';
import { Lock } from 'lucide-react';

interface LoginFormProps {
  password: string;
  setPassword: (val: string) => void;
  isLoggingIn: boolean;
  isEnvConfigured: boolean;
  handleLogin: (e: React.FormEvent) => void;
}

export default function LoginForm({
  password,
  setPassword,
  isLoggingIn,
  isEnvConfigured,
  handleLogin
}: LoginFormProps) {
  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', animation: 'fadeIn 0.5s ease' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <input
              type="password"
              className="form-control"
              placeholder="Masukkan kata sandi..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoggingIn || !isEnvConfigured}
              style={{ letterSpacing: '0.1em' }}
            />
          </div>

          <button type="submit" className="btn" style={{ marginTop: '1.5rem' }} disabled={isLoggingIn || !isEnvConfigured}>
            {isLoggingIn ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

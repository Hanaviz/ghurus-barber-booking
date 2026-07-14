"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User, Phone, Calendar, Clock, CheckCircle2, AlertCircle, CalendarRange } from 'lucide-react';

import { TIME_SLOTS, isSlotPast } from '@/lib/config';

export default function FormulirBooking() {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
  };

  const handleDateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
    if (input) {
      try {
        input.showPicker();
      } catch (err) {
        input.focus();
        input.click();
      }
    }
  };

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);

  // Success view states
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ date: '', time: '' });

  useEffect(() => {
    setDate(getTodayString());
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('your-project-id') || key.includes('your-supabase-anon-key')) {
      setIsEnvConfigured(false);
    }
  }, []);

  useEffect(() => {
    if (!isEnvConfigured || !date) return;

    const fetchBookedSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('booking_date', date)
          .neq('status', 'Batal');

        if (error) throw error;

        if (data) {
          const formattedTimes = data.map((item: any) => {
            const timeStr = item.booking_time;
            return timeStr ? timeStr.substring(0, 5).replace(':', '.') : '';
          }).filter(Boolean);
          setBookedTimes(formattedTimes);
        }
      } catch (err: any) {
        console.error("Gagal memuat slot terpesan:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchBookedSlots();
    setSelectedTime('');
  }, [date, isEnvConfigured]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || !whatsapp.trim() || !date || !selectedTime) {
      setMessage({ type: 'error', text: 'Harap lengkapi semua data form booking.' });
      return;
    }

    if (isSlotPast(date, selectedTime)) {
      setMessage({ type: 'error', text: 'Waktu booking tersebut sudah terlewati. Silakan pilih jam lain.' });
      return;
    }

    if (!isEnvConfigured) {
      setMessage({ type: 'error', text: 'Supabase belum dikonfigurasi. Atur berkas .env.local Anda.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            name: name.trim(),
            whatsapp: whatsapp.trim(),
            booking_date: date,
            booking_time: selectedTime.replace('.', ':'),
            status: 'Menunggu'
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          throw new Error("Maaf, slot waktu ini baru saja dipesan oleh orang lain. Silakan pilih slot lain.");
        }
        throw error;
      }

      // Trigger success popup state
      setSuccessData({ date, time: selectedTime });
      setIsSuccess(true);

      // Clean inputs
      setName('');
      setWhatsapp('');
      setSelectedTime('');
      setBookedTimes(prev => [...prev, selectedTime]);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat memproses booking.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setSuccessData({ date: '', time: '' });
    setMessage(null);
    setDate(getTodayString());
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {!isEnvConfigured && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Pemberitahuan Konfigurasi:</strong>
            <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
              Silakan atur kredensial Supabase Anda di dalam berkas <code>.env.local</code> terlebih dahulu agar sistem database dapat berjalan dengan baik.
            </p>
          </div>
        </div>
      )}

      {isSuccess ? (
        <div className="card success-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', animation: 'zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <div className="success-checkmark-container" style={{ marginBottom: '1.5rem' }}>
            <svg className="checkmark-svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Booking Berhasil!
          </h2>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            Jadwal pangkas rambut Anda di <strong>Ghurus Barber Clinic</strong> telah berhasil disimpan. Silakan datang tepat waktu sesuai jadwal Anda.
          </p>

          <div style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.25rem 1.5rem', 
            maxWidth: '380px', 
            margin: '0 auto 2.5rem auto', 
            textAlign: 'left',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tanggal Booking:</span> 
              <strong style={{ color: 'var(--text-main)' }}>{formatDateIndo(successData.date)}</strong>
            </div>
            <div style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Jam Booking:</span> 
              <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{successData.time.replace(':', '.')} WIB</strong>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleResetForm}
              className="btn" 
              style={{ width: 'auto', padding: '0.75rem 2rem', fontWeight: 600 }}
            >
              Booking Baru
            </button>
            <Link 
              href="/booking-status"
              className="btn btn-secondary" 
              style={{ 
                width: 'auto', 
                padding: '0.75rem 2rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 600 
              }}
            >
              Cek Status Booking
            </Link>
          </div>
        </div>
      ) : (
        <>
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
              <CalendarRange size={32} />
            </div>
            <h1 className="card-title">Booking Jadwal</h1>
            <p className="card-subtitle">Pilih jadwal potong rambut terbaik Anda dengan cepat dan mudah</p>
          </div>

          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <div>{message.text}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <div className="input-icon-wrapper">
                <User />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nomor WhatsApp</label>
              <div className="input-icon-wrapper">
                <Phone />
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Contoh: 081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pilih Tanggal</label>
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
                      if (!date) return "Pilih Tanggal";
                      const [y, m, d] = date.split('-');
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
                  value={date}
                  min={getTodayString()}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Pilih Jam</span>
                {isLoadingSlots && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'none' }}>Memeriksa slot...</span>}
              </label>
              
              <div className="slots-container">
                 {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedTimes.includes(slot);
                  const isSelected = selectedTime === slot;
                  const isPast = isSlotPast(date, slot);
                  
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-btn ${isSelected ? 'selected' : ''}`}
                      disabled={isBooked || isSubmitting || isLoadingSlots || isPast}
                      onClick={() => setSelectedTime(slot)}
                      title={isPast ? 'Waktu sudah lewat' : isBooked ? 'Sudah dipesan' : 'Tersedia'}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <button
                type="submit"
                className="btn"
                disabled={isSubmitting || isLoadingSlots || !isEnvConfigured}
              >
                {isSubmitting ? 'Memproses Booking...' : 'Booking Sekarang'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Mobile-only shortcut to check status */}
        <div className="show-on-mobile-only" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link 
            href="/booking-status" 
            style={{ 
              fontSize: '0.85rem', 
              color: 'var(--primary)', 
              fontWeight: 500, 
              textDecoration: 'underline', 
              opacity: 0.95
            }}
          >
            Sudah booking? Cek & Reschedule disini
          </Link>
        </div>
      </>
    )}
    </div>
  );
}

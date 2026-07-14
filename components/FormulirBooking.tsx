"use client";

import { useState, useEffect } from 'react';
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

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Nama lengkap wajib diisi.' });
      return;
    }
    if (!whatsapp.trim()) {
      setMessage({ type: 'error', text: 'Nomor WhatsApp wajib diisi.' });
      return;
    }
    if (!date) {
      setMessage({ type: 'error', text: 'Pilih tanggal booking.' });
      return;
    }
    if (!selectedTime) {
      setMessage({ type: 'error', text: 'Pilih jam booking yang tersedia.' });
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

      setMessage({ type: 'success', text: 'Booking berhasil.' });
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
    </div>
  );
}

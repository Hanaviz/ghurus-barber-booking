"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

import StatusSearch from './status/StatusSearch';
import BookingList from './status/BookingList';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  queue_number: number;
  status: 'Menunggu' | 'Sedang Dicukur' | 'Selesai' | 'Batal';
  session?: 'siang' | 'malam';
  created_at: string;
}

export default function StatusBookingPelanggan() {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [whatsappQuery, setWhatsappQuery] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Real-time Queue Tracking State (Dual Session)
  const [siangCurrent, setSiangCurrent] = useState(0);
  const [malamCurrent, setMalamCurrent] = useState(0);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('your-project-id') || key.includes('your-supabase-anon-key')) {
      setIsEnvConfigured(false);
    }
    
    fetchTodayActiveQueue();
  }, []);

  const fetchTodayActiveQueue = async () => {
    try {
      const today = getTodayString();
      const { data, error } = await supabase
        .from('barber_schedule')
        .select('siang_current, malam_current')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSiangCurrent(data.siang_current || 0);
        setMalamCurrent(data.malam_current || 0);
      }
    } catch (err) {
      console.error("Gagal mengambil antrean berjalan hari ini:", err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSearchDone(false);

    if (!whatsappQuery.trim()) {
      setMessage({ type: 'error', text: 'Masukkan nomor WhatsApp Anda untuk mencari.' });
      return;
    }

    if (!isEnvConfigured) {
      setMessage({ type: 'error', text: 'Supabase belum dikonfigurasi. Atur berkas .env.local terlebih dahulu.' });
      return;
    }

    setIsSearching(true);
    try {
      // Refresh antrean aktif di toko
      await fetchTodayActiveQueue();

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('whatsapp', whatsappQuery.trim())
        .order('booking_date', { ascending: false })
        .order('queue_number', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
      setSearchDone(true);
      if (!data || data.length === 0) {
        setMessage({ type: 'error', text: 'Tidak ada data booking yang ditemukan untuk nomor WhatsApp ini.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat mencari data booking.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan antrean ini?")) {
      return;
    }

    setMessage(null);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Batal' })
        .eq('id', bookingId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Antrean berhasil dibatalkan.' });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Batal' } : b));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal membatalkan antrean.' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sedang Dicukur':
        return <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 700 }}>✂️ Sedang Dicukur</span>;
      case 'Menunggu':
        return <span className="badge badge-pending">Menunggu</span>;
      case 'Selesai':
        return <span className="badge badge-completed">Selesai</span>;
      case 'Batal':
        return <span className="badge badge-cancelled">Batal</span>;
      default:
        return null;
    }
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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

      <StatusSearch 
        whatsappQuery={whatsappQuery}
        setWhatsappQuery={setWhatsappQuery}
        isSearching={isSearching}
        message={message}
        handleSearch={handleSearch}
      />

      {searchDone && (
        <BookingList 
          bookings={bookings}
          formatDateIndo={formatDateIndo}
          getStatusBadge={getStatusBadge}
          handleCancelBooking={handleCancelBooking}
          siangCurrent={siangCurrent}
          malamCurrent={malamCurrent}
        />
      )}
    </div>
  );
}

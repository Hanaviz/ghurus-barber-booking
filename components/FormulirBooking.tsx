"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

import BookingSuccess from './booking/BookingSuccess';
import BookingForm from './booking/BookingForm';

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

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [date, setDate] = useState('');
  
  // Real-time Queue settings (Dual Session)
  const [sesiAktif, setSesiAktif] = useState<'semua' | 'siang' | 'malam' | 'tutup'>('tutup');
  const [session, setSession] = useState<'siang' | 'malam'>('siang');
  
  const [siangBuka, setSiangBuka] = useState('14:00');
  const [siangMax, setSiangMax] = useState(5);
  const [siangCurrent, setSiangCurrent] = useState(0);
  
  const [malamBuka, setMalamBuka] = useState('20:00');
  const [malamMax, setMalamMax] = useState(10);
  const [malamCurrent, setMalamCurrent] = useState(0);

  const [siangCount, setSiangCount] = useState(0);
  const [malamCount, setMalamCount] = useState(0);

  interface QueueItem {
    name: string;
    queue_number: number;
    status: 'Menunggu' | 'Sedang Dicukur' | 'Selesai' | 'Batal';
    session: 'siang' | 'malam';
  }
  const [todayBookings, setTodayBookings] = useState<QueueItem[]>([]);
  
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);

  // Success view states
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ date: '', queue_number: 0, session: 'siang' as 'siang' | 'malam' });

  useEffect(() => {
    setDate(getTodayString());
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('your-project-id') || key.includes('your-supabase-anon-key')) {
      setIsEnvConfigured(false);
    }
  }, []);

  const fetchDayQueueStatus = async () => {
    if (!isEnvConfigured || !date) return;
    setIsLoadingSlots(true);
    try {
      // 1. Ambil status operasional harian & antrean saat ini
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('barber_schedule')
        .select(`
          status, sesi_aktif, 
          siang_buka, siang_max, siang_current,
          malam_buka, malam_max, malam_current
        `)
        .eq('date', date)
        .maybeSingle();

      if (scheduleError) throw scheduleError;

      if (scheduleData) {
        setSesiAktif((scheduleData.sesi_aktif as any) || 'tutup');
        setSiangBuka(scheduleData.siang_buka || '14:00');
        setSiangMax(scheduleData.siang_max || 5);
        setSiangCurrent(scheduleData.siang_current || 0);
        setMalamBuka(scheduleData.malam_buka || '20:00');
        setMalamMax(scheduleData.malam_max || 10);
        setMalamCurrent(scheduleData.malam_current || 0);
      } else {
        setSesiAktif('tutup');
        setSiangBuka('14:00');
        setSiangMax(5);
        setSiangCurrent(0);
        setMalamBuka('20:00');
        setMalamMax(10);
        setMalamCurrent(0);
      }

      // 2. Ambil antrean terdaftar hari ini
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('name, queue_number, status, session')
        .eq('booking_date', date)
        .neq('status', 'Batal')
        .order('session', { ascending: false })
        .order('queue_number', { ascending: true });

      if (bookingsError) throw bookingsError;

      const siang = bookingsData ? bookingsData.filter((b: any) => b.session === 'siang').length : 0;
      const malam = bookingsData ? bookingsData.filter((b: any) => b.session === 'malam').length : 0;

      setSiangCount(siang);
      setMalamCount(malam);
      setTodayBookings((bookingsData as any) || []);

    } catch (err: any) {
      console.error("Gagal memuat status antrean harian:", err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchDayQueueStatus();
  }, [date, isEnvConfigured]);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (sesiAktif === 'malam' || (sesiAktif === 'semua' && currentHour >= 18)) {
      setSession('malam');
    } else {
      setSession('siang');
    }
  }, [sesiAktif]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || !whatsapp.trim() || !date) {
      setMessage({ type: 'error', text: 'Harap lengkapi Nama dan nomor WhatsApp Anda.' });
      return;
    }

    if (sesiAktif === 'tutup') {
      setMessage({ type: 'error', text: 'Maaf, pendaftaran antrean untuk hari ini sedang ditutup.' });
      return;
    }

    const currentHour = new Date().getHours();

    if (session === 'siang') {
      if (sesiAktif !== 'semua' && sesiAktif !== 'siang') {
        setMessage({ type: 'error', text: 'Maaf, Sesi Siang tidak dibuka hari ini.' });
        return;
      }
      if (currentHour >= 18) {
        setMessage({ type: 'error', text: 'Maaf, pendaftaran Sesi Siang untuk hari ini sudah berakhir (Tutup pukul 18:00 WIB). Silakan mendaftar Sesi Malam.' });
        return;
      }
      if (siangCount >= siangMax) {
        setMessage({ type: 'error', text: 'Maaf, kuota antrean Sesi Siang hari ini sudah penuh.' });
        return;
      }
    } else {
      if (sesiAktif !== 'semua' && sesiAktif !== 'malam') {
        setMessage({ type: 'error', text: 'Maaf, Sesi Malam tidak dibuka hari ini.' });
        return;
      }
      if (currentHour >= 23 || currentHour < 6) {
        setMessage({ type: 'error', text: 'Maaf, pendaftaran Sesi Malam untuk malam ini sudah ditutup.' });
        return;
      }
      if (malamCount >= malamMax) {
        setMessage({ type: 'error', text: 'Maaf, kuota antrean Sesi Malam hari ini sudah penuh.' });
        return;
      }
    }

    if (!isEnvConfigured) {
      setMessage({ type: 'error', text: 'Supabase belum dikonfigurasi. Hubungi pemilik toko.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Cek apakah nomor WhatsApp ini sudah memiliki antrean AKTIF ('Menunggu' / 'Sedang Dicukur') hari ini
      const { data: activeBooking, error: checkError } = await supabase
        .from('bookings')
        .select('queue_number, session, status')
        .eq('booking_date', date)
        .eq('whatsapp', whatsapp.trim())
        .in('status', ['Menunggu', 'Sedang Dicukur'])
        .maybeSingle();

      if (checkError) throw checkError;

      if (activeBooking) {
        const prefix = activeBooking.session === 'malam' ? 'M-' : 'S-';
        const statusLabel = activeBooking.status === 'Sedang Dicukur' ? 'Sedang Dicukur' : 'Menunggu';
        setMessage({ 
          type: 'error', 
          text: `Nomor WhatsApp ini sudah memiliki antrean aktif (Tiket ${prefix}${activeBooking.queue_number} - ${statusLabel}) untuk hari ini. Harap selesaikan atau batalkan antrean sebelumnya terlebih dahulu.` 
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Dapatkan nomor antrean terkini secara aman berdasarkan sesi terpilih
      const { data: bookingsToday, error: queryError } = await supabase
        .from('bookings')
        .select('queue_number')
        .eq('booking_date', date)
        .eq('session', session)
        .neq('status', 'Batal');
      
      if (queryError) throw queryError;
      
      let nextQueueNo = 1;
      if (bookingsToday && bookingsToday.length > 0) {
        const nums = bookingsToday.map((b: any) => b.queue_number || 0);
        nextQueueNo = Math.max(...nums) + 1;
      }

      const selectedMax = session === 'siang' ? siangMax : malamMax;
      if (nextQueueNo > selectedMax) {
        throw new Error(`Maaf, kuota antrean Sesi ${session === 'siang' ? 'Siang' : 'Malam'} hari ini baru saja penuh.`);
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            name: name.trim(),
            whatsapp: whatsapp.trim(),
            booking_date: date,
            booking_time: timeStr,
            queue_number: nextQueueNo,
            session: session,
            status: 'Menunggu'
          }
        ]);

      if (error) throw error;

      // Set data sukses
      setSuccessData({ date, queue_number: nextQueueNo, session });
      setIsSuccess(true);

      // Reset input data diri
      setName('');
      setWhatsapp('');
      
      if (session === 'siang') {
        setSiangCount(prev => prev + 1);
      } else {
        setMalamCount(prev => prev + 1);
      }

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat mengambil nomor antrean.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setSuccessData({ date: '', queue_number: 0, session: 'siang' });
    setMessage(null);
    setDate(getTodayString());
    fetchDayQueueStatus();
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
        <BookingSuccess 
          successData={successData}
          handleResetForm={handleResetForm}
          formatDateIndo={formatDateIndo}
        />
      ) : (
        <BookingForm 
          name={name}
          setName={setName}
          whatsapp={whatsapp}
          setWhatsapp={setWhatsapp}
          date={date}
          sesiAktif={sesiAktif}
          session={session}
          setSession={setSession}
          siangBuka={siangBuka}
          siangMax={siangMax}
          siangCurrent={siangCurrent}
          siangCount={siangCount}
          malamBuka={malamBuka}
          malamMax={malamMax}
          malamCurrent={malamCurrent}
          malamCount={malamCount}
          todayBookings={todayBookings}
          isLoadingSlots={isLoadingSlots}
          isSubmitting={isSubmitting}
          isEnvConfigured={isEnvConfigured}
          message={message}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

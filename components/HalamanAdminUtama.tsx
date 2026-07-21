"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAdminSession, loginAdmin, logoutAdmin } from '@/app/admin/actions';
import { CalendarRange, AlertCircle, RefreshCw } from 'lucide-react';

import LoginForm from './admin/LoginForm';
import DashboardHeader from './admin/DashboardHeader';
import Toolbar from './admin/Toolbar';
import BookingsTable from './admin/BookingsTable';
import ManualBookingModal from './admin/ManualBookingModal';

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

export default function HalamanAdminUtama() {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard Data States (Locked to Today)
  const [filterDate, setFilterDate] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Queue Control States (Dual Session)
  const [sesiAktif, setSesiAktif] = useState<'semua' | 'siang' | 'malam' | 'tutup'>('tutup');
  const [siangBuka, setSiangBuka] = useState('14:00');
  const [siangMax, setSiangMax] = useState(5);
  const [siangCurrent, setSiangCurrent] = useState(0);
  const [malamBuka, setMalamBuka] = useState('20:00');
  const [malamMax, setMalamMax] = useState(10);
  const [malamCurrent, setMalamCurrent] = useState(0);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Manual Booking Modal States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualWhatsapp, setManualWhatsapp] = useState('');
  const [manualSession, setManualSession] = useState<'siang' | 'malam'>('siang');
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const today = getTodayString();
    setFilterDate(today);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('your-project-id') || key.includes('your-supabase-anon-key')) {
      setIsEnvConfigured(false);
    }

    const checkSession = async () => {
      try {
        const active = await checkAdminSession();
        setIsAuthenticated(active);
        if (active) {
          window.dispatchEvent(new Event('admin-login-status-change'));
        }
      } catch (err) {
        console.error("Gagal memeriksa session admin:", err);
      } finally {
        setIsLoadingSession(false);
      }
    };
    checkSession();
  }, []);

  const fetchBookings = async () => {
    if (!isAuthenticated || !isEnvConfigured || !filterDate) return;
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', filterDate);

      if (error) throw error;
      
      const sorted = (data || []).sort((a: any, b: any) => {
        const aIsActive = a.status === 'Menunggu';
        const bIsActive = b.status === 'Menunggu';
        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;
        
        if (a.session === 'siang' && b.session === 'malam') return -1;
        if (a.session === 'malam' && b.session === 'siang') return 1;
        
        return a.queue_number - b.queue_number;
      });

      setBookings(sorted);
    } catch (err: any) {
      console.error("Gagal memuat booking:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchDayStatus = async () => {
    if (!isAuthenticated || !isEnvConfigured || !filterDate) return;
    try {
      const { data, error } = await supabase
        .from('barber_schedule')
        .select(`
          status, max_queue, current_queue, jam_buka, sesi_aktif,
          siang_buka, siang_max, siang_current,
          malam_buka, malam_max, malam_current
        `)
        .eq('date', filterDate)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSesiAktif((data.sesi_aktif as any) || 'tutup');
        setSiangBuka(data.siang_buka || '14:00');
        setSiangMax(data.siang_max || 5);
        setSiangCurrent(data.siang_current || 0);
        setMalamBuka(data.malam_buka || '20:00');
        setMalamMax(data.malam_max || 10);
        setMalamCurrent(data.malam_current || 0);
      } else {
        setSesiAktif('tutup');
        setSiangBuka('14:00');
        setSiangMax(5);
        setSiangCurrent(0);
        setMalamBuka('20:00');
        setMalamMax(10);
        setMalamCurrent(0);
      }
    } catch (err) {
      console.error("Gagal memuat status operasional hari ini:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchDayStatus();
  }, [filterDate, isAuthenticated, isEnvConfigured]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await loginAdmin(password);
      if (res && res.success) {
        setIsAuthenticated(true);
        setPassword('');
        setLoginError(null);
        window.dispatchEvent(new Event('admin-login-status-change'));
        showToast("Berhasil masuk ke Dashboard Admin.", "success");
      } else {
        const errText = res?.error || "Kata sandi salah! Silakan periksa kembali.";
        setLoginError(errText);
        showToast(errText, "error");
      }
    } catch (err: any) {
      const errText = "Terjadi kesalahan: " + err.message;
      setLoginError(errText);
      showToast(errText, "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setIsAuthenticated(false);
      window.dispatchEvent(new Event('admin-login-status-change'));
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  const handleUpdateDayStatus = async (
    sesiAktifVal: 'semua' | 'siang' | 'malam' | 'tutup',
    siangBukaVal: string,
    siangMaxVal: number,
    malamBukaVal: string,
    malamMaxVal: number
  ) => {
    if (!filterDate) return;

    // Cek jika terdapat antrean aktif (Menunggu / Sedang Dicukur) pada hari ini
    const activeBookings = bookings.filter(b => b.status === 'Menunggu' || b.status === 'Sedang Dicukur');
    
    let targetAffected: typeof activeBookings = [];
    if (sesiAktifVal === 'tutup') {
      targetAffected = activeBookings;
    } else if (sesiAktifVal === 'siang') {
      targetAffected = activeBookings.filter(b => b.session === 'malam');
    } else if (sesiAktifVal === 'malam') {
      targetAffected = activeBookings.filter(b => b.session === 'siang');
    }

    if (targetAffected.length > 0) {
      const sessionLabel = sesiAktifVal === 'tutup' ? 'MENUTUP SEMUA SESI' : `menonaktifkan Sesi ${sesiAktifVal === 'siang' ? 'Malam' : 'Siang'}`;
      const confirmAction = window.confirm(
        `⚠️ PERINGATAN OPERASIONAL:\n\nSaat ini masih terdapat ${targetAffected.length} antrean aktif yang sudah terdaftar.\n\nTindakan ${sessionLabel} HANYA akan menghentikan pendaftaran antrean BARU dari pelanggan publik. Data antrean yang sudah terdaftar tetap 100% aman dan dapat Anda proses sampai selesai.\n\nApakah Anda yakin ingin melanjutkan penyimpanan?`
      );
      if (!confirmAction) {
        return;
      }
    }

    setIsSavingStatus(true);
    try {
      const statusVal = sesiAktifVal === 'tutup' ? 'tutup' : 'buka';
      const { error } = await supabase
        .from('barber_schedule')
        .upsert({
          date: filterDate,
          status: statusVal,
          sesi_aktif: sesiAktifVal,
          siang_buka: siangBukaVal,
          siang_max: siangMaxVal,
          malam_buka: malamBukaVal,
          malam_max: malamMaxVal
        });

      if (error) throw error;
      setSesiAktif(sesiAktifVal);
      setSiangBuka(siangBukaVal);
      setSiangMax(siangMaxVal);
      setMalamBuka(malamBukaVal);
      setMalamMax(malamMaxVal);

      if (sesiAktifVal === 'tutup' && activeBookings.length > 0) {
        showToast(`Sesi ditutup untuk pendaftaran baru. ${activeBookings.length} antrean aktif tetap dapat diproses.`, "success");
      } else {
        showToast("Pengaturan operasional sesi antrean berhasil diperbarui.", "success");
      }
    } catch (err: any) {
      showToast("Gagal memperbarui pengaturan: " + err.message, "error");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleNextQueue = async (session: 'siang' | 'malam') => {
    if (!filterDate) return;
    const nextVal = session === 'siang' ? siangCurrent + 1 : malamCurrent + 1;
    try {
      const updateData: any = { date: filterDate };
      if (session === 'siang') {
        updateData.siang_current = nextVal;
      } else {
        updateData.malam_current = nextVal;
      }

      const { error } = await supabase
        .from('barber_schedule')
        .upsert(updateData);

      if (error) throw error;
      if (session === 'siang') {
        setSiangCurrent(nextVal);
        showToast(`Memanggil Antrean Siang No. S-${nextVal}`, "success");
      } else {
        setMalamCurrent(nextVal);
        showToast(`Memanggil Antrean Malam No. M-${nextVal}`, "success");
      }
    } catch (err: any) {
      showToast("Gagal memanggil antrean berikutnya: " + err.message, "error");
    }
  };

  const handleResetQueue = async (session: 'siang' | 'malam') => {
    const label = session === 'siang' ? 'Sesi Siang' : 'Sesi Malam';
    if (!window.confirm(`Apakah Anda yakin ingin mereset antrean berjalan ${label} hari ini menjadi 0?`)) {
      return;
    }
    if (!filterDate) return;
    try {
      const updateData: any = { date: filterDate };
      if (session === 'siang') {
        updateData.siang_current = 0;
      } else {
        updateData.malam_current = 0;
      }

      const { error } = await supabase
        .from('barber_schedule')
        .upsert(updateData);

      if (error) throw error;
      if (session === 'siang') {
        setSiangCurrent(0);
      } else {
        setMalamCurrent(0);
      }
      showToast(`Antrean berjalan ${label} berhasil di-reset ke 0.`, "success");
    } catch (err: any) {
      showToast("Gagal mereset antrean: " + err.message, "error");
    }
  };

  const handleCallBooking = async (booking: any) => {
    try {
      const fieldToUpdate = booking.session === 'malam' ? 'malam_current' : 'siang_current';
      const { error } = await supabase
        .from('barber_schedule')
        .update({ [fieldToUpdate]: booking.queue_number })
        .eq('date', filterDate);

      if (error) throw error;
      
      if (booking.session === 'malam') {
        setMalamCurrent(booking.queue_number);
      } else {
        setSiangCurrent(booking.queue_number);
      }
      
      const prefix = booking.session === 'malam' ? 'M-' : 'S-';
      showToast(`Memanggil Antrean ${booking.session === 'siang' ? 'Siang' : 'Malam'} No. ${prefix}${booking.queue_number}`, "success");
    } catch (err: any) {
      showToast("Gagal memanggil antrean: " + err.message, "error");
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: 'Sedang Dicukur' | 'Selesai' | 'Menunggu' | 'Batal') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) {
        if (error.message?.includes('bookings_status_check')) {
          showToast("Gagal: Database Supabase membatasi status 'Sedang Dicukur'. Harap jalankan SQL migration di Supabase SQL Editor.", "error");
          return;
        }
        throw error;
      }
      
      setBookings(prev => {
        const updated = prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
        return updated.sort((a: any, b: any) => {
          const getOrder = (status: string) => {
            if (status === 'Sedang Dicukur') return 0;
            if (status === 'Menunggu') return 1;
            return 2;
          };
          const orderA = getOrder(a.status);
          const orderB = getOrder(b.status);
          if (orderA !== orderB) return orderA - orderB;
          return a.queue_number - b.queue_number;
        });
      });

      showToast(`Status booking berhasil diubah menjadi ${newStatus}.`, "success");
    } catch (err: any) {
      showToast("Gagal mengubah status: " + err.message, "error");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data booking ini secara permanen?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      showToast("Data booking berhasil dihapus secara permanen.", "success");
    } catch (err: any) {
      showToast("Gagal menghapus booking: " + err.message, "error");
    }
  };

  const handleAddManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualWhatsapp.trim() || !filterDate) {
      showToast("Harap lengkapi semua data form booking manual.", "error");
      return;
    }

    setIsSavingManual(true);
    try {
      // Dapatkan nomor antrean berikutnya berdasarkan sesi terpilih
      const { data: bookingsToday, error: queryError } = await supabase
        .from('bookings')
        .select('queue_number')
        .eq('booking_date', filterDate)
        .eq('session', manualSession)
        .neq('status', 'Batal');
      
      if (queryError) throw queryError;
      
      let nextQueueNo = 1;
      if (bookingsToday && bookingsToday.length > 0) {
        const nums = bookingsToday.map((b: any) => b.queue_number || 0);
        nextQueueNo = Math.max(...nums) + 1;
      }

      const selectedMax = manualSession === 'siang' ? siangMax : malamMax;
      if (nextQueueNo > selectedMax) {
        showToast(`Gagal: Sudah melebihi batas kuota antrean Sesi ${manualSession === 'siang' ? 'Siang' : 'Malam'} hari ini.`, "error");
        setIsSavingManual(false);
        return;
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            name: manualName.trim(),
            whatsapp: manualWhatsapp.trim(),
            booking_date: filterDate,
            booking_time: timeStr,
            queue_number: nextQueueNo,
            session: manualSession,
            status: 'Menunggu'
          }
        ]);

      if (error) throw error;

      fetchBookings();

      setManualName('');
      setManualWhatsapp('');
      setShowManualModal(false);
      const prefix = manualSession === 'malam' ? 'M-' : 'S-';
      showToast(`Booking manual berhasil ditambahkan. Antrean No. ${prefix}${nextQueueNo}`, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan booking manual.", "error");
    } finally {
      setIsSavingManual(false);
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

  if (isLoadingSession) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={36} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem', color: 'var(--primary)' }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Memeriksa sesi admin...</p>
      </div>
    );
  }

  if (!isEnvConfigured) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)', margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Konfigurasi Supabase Diperlukan</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
          Harap isi variabel <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di file <code>.env.local</code> terlebih dahulu untuk mengakses dashboard admin.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm 
        password={password}
        setPassword={setPassword}
        isLoggingIn={isLoggingIn}
        isEnvConfigured={isEnvConfigured}
        handleLogin={handleLogin}
        error={loginError}
      />
    );
  }

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <DashboardHeader handleLogout={handleLogout} />

      <Toolbar 
        filterDate={filterDate}
        sesiAktif={sesiAktif}
        siangBuka={siangBuka}
        siangMax={siangMax}
        malamBuka={malamBuka}
        malamMax={malamMax}
        isSavingStatus={isSavingStatus}
        handleUpdateDayStatus={handleUpdateDayStatus}
        openManualBookingModal={() => {
          setManualSession(sesiAktif === 'malam' ? 'malam' : 'siang');
          setShowManualModal(true);
        }}
      />

      {isLoadingData ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '0.5rem', color: 'var(--primary)' }} />
          <p>Memuat data booking...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <CalendarRange size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Belum ada antrean masuk hari ini.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Gunakan tombol booking manual untuk menambahkan pelanggan walk-in.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: "'Playfair Display', serif" }}>Daftar Antrean Hari Ini</h3>
          </div>
          <BookingsTable 
            bookings={bookings}
            getStatusBadge={getStatusBadge}
            handleUpdateStatus={handleUpdateStatus}
            handleDeleteBooking={handleDeleteBooking}
            handleCallBooking={handleCallBooking}
          />
        </>
      )}

      {showManualModal && (
        <ManualBookingModal 
          manualName={manualName}
          setManualName={setManualName}
          manualWhatsapp={manualWhatsapp}
          setManualWhatsapp={setManualWhatsapp}
          manualSession={manualSession}
          setManualSession={setManualSession}
          isSavingManual={isSavingManual}
          handleAddManualBooking={handleAddManualBooking}
          closeModal={() => setShowManualModal(false)}
          sesiAktif={sesiAktif}
          siangCount={bookings.filter(b => b.session === 'siang' && b.status !== 'Batal').length}
          malamCount={bookings.filter(b => b.session === 'malam' && b.status !== 'Batal').length}
          siangMax={siangMax}
          malamMax={malamMax}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          color: '#ffffff',
          padding: '0.85rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          fontSize: '0.9rem',
          minWidth: '280px',
          backdropFilter: 'blur(8px)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          borderLeft: '4px solid rgba(255,255,255,0.4)',
          fontFamily: "'Outfit', sans-serif"
        }}>
          {toast.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}

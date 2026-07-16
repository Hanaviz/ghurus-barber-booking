"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAdminSession, loginAdmin, logoutAdmin } from '@/app/admin/actions';
import { CalendarRange, AlertCircle, RefreshCw } from 'lucide-react';

import { TIME_SLOTS, isSlotPast } from '@/lib/config';
import LoginForm from './admin/LoginForm';
import DashboardHeader from './admin/DashboardHeader';
import Toolbar from './admin/Toolbar';
import BookingsTable from './admin/BookingsTable';
import ManualBookingModal from './admin/ManualBookingModal';
import RescheduleModal from './admin/RescheduleModal';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  status: 'Menunggu' | 'Selesai' | 'Batal';
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

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);

  // Dashboard Data States
  const [filterDate, setFilterDate] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Manual Booking Modal States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualWhatsapp, setManualWhatsapp] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  
  interface BookedSlot {
    time: string;
    name: string;
  }
  const [manualBookedSlots, setManualBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingManualSlots, setIsLoadingManualSlots] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Reschedule Modal States
  const [activeReschedule, setActiveReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleBookedSlots, setRescheduleBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingRescheduleSlots, setIsLoadingRescheduleSlots] = useState(false);
  const [isSavingReschedule, setIsSavingReschedule] = useState(false);

  useEffect(() => {
    const today = getTodayString();
    setFilterDate(today);
    setManualDate(today);
    setRescheduleDate(today);

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
        .eq('booking_date', filterDate)
        .order('booking_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      console.error("Gagal memuat booking:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterDate, isAuthenticated, isEnvConfigured]);

  useEffect(() => {
    if (!showManualModal || !isEnvConfigured || !manualDate) return;

    const fetchBookedSlots = async () => {
      setIsLoadingManualSlots(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time, name')
          .eq('booking_date', manualDate)
          .neq('status', 'Batal');

        if (error) throw error;
        if (data) {
          const slots: BookedSlot[] = data.map((item: any) => {
            const timeStr = item.booking_time;
            return {
              time: timeStr ? timeStr.substring(0, 5).replace(':', '.') : '',
              name: item.name
            };
          }).filter(s => s.time !== '');
          setManualBookedSlots(slots);
        }
      } catch (err) {
        console.error("Gagal memeriksa slot manual:", err);
      } finally {
        setIsLoadingManualSlots(false);
      }
    };
    fetchBookedSlots();
    setManualTime('');
  }, [manualDate, showManualModal, isEnvConfigured]);

  useEffect(() => {
    if (!activeReschedule || !isEnvConfigured || !rescheduleDate) return;

    const fetchBookedSlots = async () => {
      setIsLoadingRescheduleSlots(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time, name')
          .eq('booking_date', rescheduleDate)
          .neq('status', 'Batal');

        if (error) throw error;
        if (data) {
          const slots: BookedSlot[] = data.map((item: any) => {
            const timeStr = item.booking_time;
            return {
              time: timeStr ? timeStr.substring(0, 5).replace(':', '.') : '',
              name: item.name
            };
          }).filter(s => s.time !== '');

          const currentFormattedTime = activeReschedule.booking_time.substring(0, 5).replace(':', '.');
          if (rescheduleDate === activeReschedule.booking_date) {
            setRescheduleBookedSlots(slots.filter(s => s.time !== currentFormattedTime));
          } else {
            setRescheduleBookedSlots(slots);
          }
        }
      } catch (err) {
        console.error("Gagal memeriksa slot reschedule:", err);
      } finally {
        setIsLoadingRescheduleSlots(false);
      }
    };
    fetchBookedSlots();
    setRescheduleTime('');
  }, [rescheduleDate, activeReschedule, isEnvConfigured]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoggingIn(true);
    try {
      const success = await loginAdmin(password);
      if (success) {
        setIsAuthenticated(true);
        setPassword('');
        window.dispatchEvent(new Event('admin-login-status-change'));
      } else {
        alert("Kata sandi salah!");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
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

  const handleUpdateStatus = async (bookingId: string, newStatus: 'Selesai' | 'Menunggu' | 'Batal') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      alert("Gagal mengubah status: " + err.message);
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
    } catch (err: any) {
      alert("Gagal menghapus booking: " + err.message);
    }
  };

  const handleAddManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualWhatsapp.trim() || !manualDate || !manualTime) {
      alert("Harap lengkapi semua data form booking manual.");
      return;
    }
    if (isSlotPast(manualDate, manualTime)) {
      alert("Waktu booking tersebut sudah terlewati. Silakan pilih jam lain.");
      return;
    }

    setIsSavingManual(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            name: manualName.trim(),
            whatsapp: manualWhatsapp.trim(),
            booking_date: manualDate,
            booking_time: manualTime.replace('.', ':'),
            status: 'Menunggu'
          }
        ]);

      if (error) {
        if (error.code === '23505') throw new Error("Maaf, slot waktu ini baru saja dipesan oleh orang lain. Silakan pilih slot lain.");
        throw error;
      }

      if (manualDate === filterDate) {
        fetchBookings();
      }

      setManualName('');
      setManualWhatsapp('');
      setManualTime('');
      setShowManualModal(false);
      alert("Booking manual berhasil ditambahkan.");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan booking manual.");
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleSaveReschedule = async () => {
    if (!activeReschedule) return;
    if (!rescheduleDate || !rescheduleTime) {
      alert("Harap tentukan tanggal dan jam baru.");
      return;
    }
    if (isSlotPast(rescheduleDate, rescheduleTime)) {
      alert("Waktu reschedule tersebut sudah terlewati. Silakan pilih jam lain.");
      return;
    }

    setIsSavingReschedule(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: rescheduleDate,
          booking_time: rescheduleTime.replace('.', ':'),
          status: 'Menunggu'
        })
        .eq('id', activeReschedule.id);

      if (error) {
        if (error.code === '23505') throw new Error("Maaf, slot waktu ini baru saja dipesan oleh orang lain. Silakan pilih slot lain.");
        throw error;
      }

      if (rescheduleDate === filterDate) {
        setBookings(prev => prev.map(b => 
          b.id === activeReschedule.id 
            ? { ...b, booking_date: rescheduleDate, booking_time: rescheduleTime.replace('.', ':') + ":00", status: 'Menunggu' } 
            : b
        ));
      } else {
        setBookings(prev => prev.filter(b => b.id !== activeReschedule.id));
      }

      setActiveReschedule(null);
      alert("Jadwal booking berhasil diubah.");
    } catch (err: any) {
      alert(err.message || "Gagal melakukan reschedule.");
    } finally {
      setIsSavingReschedule(false);
    }
  };

  const openRescheduleModal = (booking: Booking) => {
    setActiveReschedule(booking);
    setRescheduleDate(booking.booking_date);
    setRescheduleTime(booking.booking_time.substring(0, 5).replace(':', '.'));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
          Harap isi variabel <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di file <code>.env.local</code> terlebih dahulu untuk mengakses dashboard admin.
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
      />
    );
  }

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <DashboardHeader handleLogout={handleLogout} />

      <Toolbar 
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        handleDateClick={handleDateClick}
        openManualBookingModal={() => {
          setShowManualModal(true);
          setManualDate(filterDate || getTodayString());
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
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Tidak ada jadwal booking untuk tanggal ini.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Gunakan tombol booking manual untuk menambahkan slot walk-in.</p>
        </div>
      ) : (
        <BookingsTable 
          bookings={bookings}
          TIME_SLOTS={TIME_SLOTS}
          getStatusBadge={getStatusBadge}
          handleUpdateStatus={handleUpdateStatus}
          handleDeleteBooking={handleDeleteBooking}
          openRescheduleModal={openRescheduleModal}
        />
      )}

      {showManualModal && (
        <ManualBookingModal 
          manualName={manualName}
          setManualName={setManualName}
          manualWhatsapp={manualWhatsapp}
          setManualWhatsapp={setManualWhatsapp}
          manualDate={manualDate}
          setManualDate={setManualDate}
          manualTime={manualTime}
          setManualTime={setManualTime}
          manualBookedSlots={manualBookedSlots}
          isLoadingManualSlots={isLoadingManualSlots}
          isSavingManual={isSavingManual}
          TIME_SLOTS={TIME_SLOTS}
          handleDateClick={handleDateClick}
          isSlotPast={isSlotPast}
          handleAddManualBooking={handleAddManualBooking}
          closeModal={() => setShowManualModal(false)}
        />
      )}

      {activeReschedule && (
        <RescheduleModal 
          activeReschedule={activeReschedule}
          rescheduleDate={rescheduleDate}
          setRescheduleDate={setRescheduleDate}
          rescheduleTime={rescheduleTime}
          setRescheduleTime={setRescheduleTime}
          rescheduleBookedSlots={rescheduleBookedSlots}
          isLoadingRescheduleSlots={isLoadingRescheduleSlots}
          isSavingReschedule={isSavingReschedule}
          TIME_SLOTS={TIME_SLOTS}
          handleDateClick={handleDateClick}
          isSlotPast={isSlotPast}
          handleSaveReschedule={handleSaveReschedule}
          closeModal={() => setActiveReschedule(null)}
        />
      )}
    </div>
  );
}

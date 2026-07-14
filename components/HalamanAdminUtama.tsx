"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { loginAdmin, logoutAdmin, checkAdminSession } from '@/app/admin/actions';
import { 
  Lock, LogOut, Calendar, Clock, Trash2, Edit2, Plus, 
  Phone, User, Check, X, AlertTriangle, RefreshCw 
} from 'lucide-react';

import { TIME_SLOTS, isSlotPast } from '@/lib/config';

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
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);

  // Dashboard States
  const [filterDate, setFilterDate] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Manual Booking Modal States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualWhatsapp, setManualWhatsapp] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [manualBookedTimes, setManualBookedTimes] = useState<string[]>([]);
  const [isLoadingManualSlots, setIsLoadingManualSlots] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Reschedule Modal States
  const [activeReschedule, setActiveReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleBookedTimes, setRescheduleBookedTimes] = useState<string[]>([]);
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
          .select('booking_time')
          .eq('booking_date', manualDate)
          .neq('status', 'Batal');

        if (error) throw error;
        if (data) {
          const formatted = data.map((item: any) => item.booking_time ? item.booking_time.substring(0, 5).replace(':', '.') : '');
          setManualBookedTimes(formatted);
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
          .select('booking_time')
          .eq('booking_date', rescheduleDate)
          .neq('status', 'Batal');

        if (error) throw error;
        if (data) {
          const formatted = data.map((item: any) => item.booking_time ? item.booking_time.substring(0, 5).replace(':', '.') : '');
          const currentFormattedTime = activeReschedule.booking_time.substring(0, 5).replace(':', '.');
          if (rescheduleDate === activeReschedule.booking_date) {
            setRescheduleBookedTimes(formatted.filter(t => t !== currentFormattedTime));
          } else {
            setRescheduleBookedTimes(formatted);
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
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await loginAdmin(password);
      if (res.success) {
        setIsAuthenticated(true);
        window.dispatchEvent(new Event('admin-login-status-change'));
      } else {
        setLoginError(res.error || 'Password salah.');
      }
    } catch (err) {
      setLoginError('Terjadi kesalahan koneksi server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setPassword('');
    window.dispatchEvent(new Event('admin-login-status-change'));
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: 'Menunggu' | 'Selesai' | 'Batal') => {
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
            booking_time: manualTime,
            status: 'Menunggu'
          }
        ]);

      if (error) {
        if (error.code === '23505') throw new Error("Slot waktu tersebut sudah dipesan. Pilih waktu lain.");
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
          booking_time: rescheduleTime,
          status: 'Menunggu'
        })
        .eq('id', activeReschedule.id);

      if (error) {
        if (error.code === '23505') throw new Error("Slot waktu tersebut sudah dipesan. Pilih waktu lain.");
        throw error;
      }

      fetchBookings();
      setActiveReschedule(null);
      alert("Jadwal booking berhasil dipindahkan.");
    } catch (err: any) {
      alert(err.message || "Gagal mengubah jadwal.");
    } finally {
      setIsSavingReschedule(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Menunggu': return <span className="badge badge-pending">Menunggu</span>;
      case 'Selesai': return <span className="badge badge-completed">Selesai</span>;
      case 'Batal': return <span className="badge badge-cancelled">Batal</span>;
      default: return null;
    }
  };

  if (isLoadingSession) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
        <span style={{ color: 'var(--text-muted)' }}>Memeriksa autentikasi...</span>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto 0 auto' }}>
        {!isEnvConfigured && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertTriangle size={20} />
            <div>Konfigurasi Supabase (.env.local) belum terdeteksi.</div>
          </div>
        )}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '1rem', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(197, 168, 128, 0.1)', 
              color: 'var(--primary)',
              marginBottom: '1rem'
            }}>
              <Lock size={28} />
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Login Admin</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Akses dashboard booking barbershop</p>
          </div>

          {loginError && (
            <div className="alert alert-error" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
              <X size={16} />
              <div>{loginError}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Sandi Admin</label>
              <div className="input-icon-wrapper">
                <Lock />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Masukkan password admin..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
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

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>Dashboard Admin</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Atur jadwal pemesanan, konfirmasi, dan walk-in pelanggan</p>
        </div>
        <button className="btn btn-secondary hide-on-mobile" style={{ width: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={handleLogout}>
          <LogOut size={16} /> Keluar
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} style={{ color: 'var(--text-main)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter Tanggal:</span>
          </div>
          <div onClick={handleDateClick} style={{ position: 'relative', width: '160px', cursor: 'pointer' }}>
            <div className="form-control" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.5rem 1rem',
              height: '38px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                {(() => {
                  if (!filterDate) return "Pilih Tanggal";
                  const [y, m, d] = filterDate.split('-');
                  return `${d}/${m}/${y}`;
                })()}
              </span>
              <Calendar size={14} style={{ color: 'var(--text-main)', opacity: 0.8 }} />
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
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn" style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }} onClick={() => setShowManualModal(true)}>
            <Plus size={16} /> Booking Manual (Walk-in)
          </button>
        </div>
      </div>

      {isLoadingData ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '0.5rem', color: 'var(--primary)' }} />
          <p>Memuat data booking...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Tidak ada jadwal booking untuk tanggal ini.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Gunakan tombol booking manual untuk menambahkan slot walk-in.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>WhatsApp</th>
                <th>Jam Booking</th>
                <th>Status</th>
                <th>Konfirmasi Cepat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td data-label="Nama" style={{ fontWeight: 600 }}>{booking.name}</td>
                  <td data-label="WhatsApp">
                    <a 
                      href={`https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)' }}
                      title="Hubungi via WhatsApp"
                    >
                      <Phone size={14} />
                      {booking.whatsapp}
                    </a>
                  </td>
                  <td data-label="Jam Booking">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <Clock size={14} style={{ color: 'var(--primary)' }} />
                      {booking.booking_time.substring(0, 5).replace(':', '.')}
                    </span>
                  </td>
                  <td data-label="Status">{getStatusBadge(booking.status)}</td>
                  <td data-label="Konfirmasi">
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleUpdateStatus(booking.id, 'Selesai')} 
                        style={booking.status === 'Selesai' ? { backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderColor: 'var(--success)' } : {}}
                        title="Tandai Selesai"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleUpdateStatus(booking.id, 'Menunggu')} 
                        style={booking.status === 'Menunggu' ? { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderColor: 'var(--warning)' } : {}}
                        title="Tandai Menunggu"
                      >
                        <Clock size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        onClick={() => handleUpdateStatus(booking.id, 'Batal')} 
                        style={booking.status === 'Batal' ? { backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger)' } : {}}
                        title="Tandai Batal"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                  <td data-label="Aksi">
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => {
                          setActiveReschedule(booking);
                          setRescheduleDate(booking.booking_date);
                          setRescheduleTime(booking.booking_time.substring(0, 5).replace(':', '.'));
                        }}
                        title="Reschedule / Edit Jadwal"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        onClick={() => handleDeleteBooking(booking.id)}
                        title="Hapus Booking Permanen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Booking Manual */}
      {showManualModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Tambah Booking Manual (Walk-in)</h3>
              <button className="modal-close" onClick={() => setShowManualModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddManualBooking}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Pelanggan</label>
                  <div className="input-icon-wrapper">
                    <User />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Walk-in Budi"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      required
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
                      placeholder="Contoh: 081234567890 (atau 'Walk-in')"
                      value={manualWhatsapp}
                      onChange={(e) => setManualWhatsapp(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Booking</label>
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
                          if (!manualDate) return "Pilih Tanggal Booking";
                          const [y, m, d] = manualDate.split('-');
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
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Pilih Slot Jam</span>
                    {isLoadingManualSlots && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memeriksa slot...</span>}
                  </label>
                  
                  <div className="slots-container" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = manualBookedTimes.includes(slot);
                      const isSelected = manualTime === slot;
                      const isPast = isSlotPast(manualDate, slot);
                      
                      return (
                        <button
                          key={slot}
                          type="button"
                          className={`slot-btn ${isSelected ? 'selected' : ''}`}
                          disabled={isBooked || isLoadingManualSlots || isPast}
                          onClick={() => setManualTime(slot)}
                          title={isPast ? 'Waktu sudah lewat' : isBooked ? 'Sudah dipesan' : 'Tersedia'}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                  onClick={() => setShowManualModal(false)}
                  disabled={isSavingManual}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                  disabled={isSavingManual || isLoadingManualSlots || !manualTime}
                >
                  {isSavingManual ? 'Menyimpan...' : 'Tambah Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reschedule Admin */}
      {activeReschedule && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reschedule Booking Admin</h3>
              <button className="modal-close" onClick={() => setActiveReschedule(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Mengubah jadwal booking untuk: <strong>{activeReschedule.name}</strong>
              </p>

              <div className="form-group">
                <label className="form-label">Pilih Tanggal Baru</label>
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
                        if (!rescheduleDate) return "Pilih Tanggal Baru";
                        const [y, m, d] = rescheduleDate.split('-');
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
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Pilih Slot Jam Baru</span>
                  {isLoadingRescheduleSlots && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memeriksa slot...</span>}
                </label>
                
                <div className="slots-container" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = rescheduleBookedTimes.includes(slot);
                    const isCurrent = activeReschedule.booking_date === rescheduleDate && activeReschedule.booking_time.substring(0, 5) === slot;
                    const isSelected = rescheduleTime === slot;
                    const isPast = isSlotPast(rescheduleDate, slot);
                    
                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`slot-btn ${isSelected ? 'selected' : ''}`}
                        disabled={isBooked || isLoadingRescheduleSlots || isPast}
                        onClick={() => setRescheduleTime(slot)}
                        style={isCurrent ? { borderColor: 'rgba(197, 168, 128, 0.4)' } : {}}
                        title={isCurrent ? 'Jadwal saat ini' : isPast ? 'Waktu sudah lewat' : isBooked ? 'Sudah dipesan' : 'Tersedia'}
                      >
                        {slot} {isCurrent && '*'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                onClick={() => setActiveReschedule(null)}
                disabled={isSavingReschedule}
              >
                Batal
              </button>
              <button 
                type="button" 
                className="btn" 
                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                onClick={handleSaveReschedule}
                disabled={isSavingReschedule || isLoadingRescheduleSlots || !rescheduleTime}
              >
                {isSavingReschedule ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

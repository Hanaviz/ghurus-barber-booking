"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Phone, Calendar, Clock, Edit2, Trash2, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

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

export default function StatusBookingPelanggan() {
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

  const [whatsappQuery, setWhatsappQuery] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reschedule Modal States
  const [activeReschedule, setActiveReschedule] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSavingReschedule, setIsSavingReschedule] = useState(false);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);

  useEffect(() => {
    setNewDate(getTodayString());
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('your-project-id') || key.includes('your-supabase-anon-key')) {
      setIsEnvConfigured(false);
    }
  }, []);

  useEffect(() => {
    if (!isEnvConfigured || !activeReschedule || !newDate) return;

    const fetchBookedSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('booking_date', newDate)
          .neq('status', 'Batal');

        if (error) throw error;

        if (data) {
          const formattedTimes = data.map((item: any) => {
            const timeStr = item.booking_time;
            return timeStr ? timeStr.substring(0, 5).replace(':', '.') : '';
          }).filter(Boolean);
          
          const currentFormattedTime = activeReschedule.booking_time.substring(0, 5).replace(':', '.');
          if (newDate === activeReschedule.booking_date) {
            const filteredTimes = formattedTimes.filter(t => t !== currentFormattedTime);
            setBookedTimes(filteredTimes);
          } else {
            setBookedTimes(formattedTimes);
          }
        }
      } catch (err: any) {
        console.error("Gagal memuat slot kosong saat reschedule:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchBookedSlots();
    setNewTime('');
  }, [newDate, activeReschedule, isEnvConfigured]);

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
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('whatsapp', whatsappQuery.trim())
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

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
    if (!window.confirm("Apakah Anda yakin ingin membatalkan jadwal booking ini?")) {
      return;
    }

    setMessage(null);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Batal' })
        .eq('id', bookingId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Booking berhasil dibatalkan.' });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Batal' } : b));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal membatalkan booking.' });
    }
  };

  const openRescheduleModal = (booking: Booking) => {
    setActiveReschedule(booking);
    setNewDate(booking.booking_date);
    setNewTime(booking.booking_time.substring(0, 5).replace(':', '.'));
    setMessage(null);
  };

  const handleSaveReschedule = async () => {
    if (!activeReschedule) return;
    if (!newDate) {
      alert("Pilih tanggal baru.");
      return;
    }
    if (!newTime) {
      alert("Pilih jam baru.");
      return;
    }
    if (isSlotPast(newDate, newTime)) {
      alert("Waktu reschedule tersebut sudah terlewati. Silakan pilih jam lain.");
      return;
    }

    setIsSavingReschedule(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: newDate,
          booking_time: newTime.replace('.', ':'),
          status: 'Menunggu'
        })
        .eq('id', activeReschedule.id);

      if (error) {
        if (error.code === '23505') {
          throw new Error("Maaf, slot waktu tersebut baru saja dipesan oleh orang lain. Silakan pilih waktu yang lain.");
        }
        throw error;
      }

      setMessage({ type: 'success', text: 'Jadwal booking berhasil diubah (reschedule).' });
      
      setBookings(prev => prev.map(b => 
        b.id === activeReschedule.id 
          ? { ...b, booking_date: newDate, booking_time: newTime.replace('.', ':') + ":00", status: 'Menunggu' } 
          : b
      ));

      setActiveReschedule(null);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah jadwal.');
    } finally {
      setIsSavingReschedule(false);
    }
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
      <div className="card status-search-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(197, 168, 128, 0.1)', 
            color: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            <RefreshCw size={32} />
          </div>
          <h1 className="card-title">Cek & Reschedule</h1>
          <p className="card-subtitle">Cari booking Anda dan sesuaikan kembali jadwal pangkas jika ada kendala</p>
        </div>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <div>{message.text}</div>
          </div>
        )}

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <div className="input-icon-wrapper">
              <Phone />
              <input
                type="tel"
                className="form-control"
                placeholder="Masukkan nomor WhatsApp saat booking..."
                value={whatsappQuery}
                onChange={(e) => setWhatsappQuery(e.target.value)}
                required
                disabled={isSearching}
              />
            </div>
          </div>
          <button type="submit" className="btn" style={{ width: 'auto', padding: '0 1.5rem' }} disabled={isSearching}>
            {isSearching ? 'Mencari...' : <Search size={20} />}
          </button>
        </form>
      </div>

      {searchDone && bookings.length > 0 && (
        <div style={{ marginTop: '2rem', animation: 'slideUp 0.3s ease' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Daftar Booking Pelanggan: <span style={{ color: 'var(--primary)' }}>{bookings[0].name}</span>
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-item-card">
                <div className="booking-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600 }}>{formatDateIndo(booking.booking_date)}</span>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="booking-item-details">
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jam Booking</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <Clock size={16} style={{ color: 'var(--primary)' }} />
                      {booking.booking_time.substring(0, 5).replace(':', '.')} WIB
                    </strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nama WhatsApp</span>
                    <span style={{ display: 'block', marginTop: '0.25rem' }}>{booking.whatsapp}</span>
                  </div>
                </div>

                {booking.status === 'Menunggu' && (
                  <div className="booking-item-actions">
                    <button
                      onClick={() => openRescheduleModal(booking)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', flex: 1 }}
                    >
                      <Edit2 size={16} /> Reschedule
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn btn-secondary btn-danger"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto' }}
                      title="Batalkan Booking"
                    >
                      <Trash2 size={16} /> Batal
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReschedule && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Ubah Jadwal Booking</h3>
              <button className="modal-close" onClick={() => setActiveReschedule(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Reschedule untuk <strong>{activeReschedule.name}</strong> ({activeReschedule.whatsapp})
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
                        if (!newDate) return "Pilih Tanggal Baru";
                        const [y, m, d] = newDate.split('-');
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
                    value={newDate}
                    min={getTodayString()}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Pilih Jam Baru</span>
                  {isLoadingSlots && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'none' }}>Memeriksa slot...</span>}
                </label>
                
                <div className="slots-container" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedTimes.includes(slot);
                    const isCurrentTime = activeReschedule.booking_date === newDate && activeReschedule.booking_time.substring(0, 5) === slot;
                    const isPast = isSlotPast(newDate, slot);
                    const isSelected = newTime === slot;
                    
                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`slot-btn ${isSelected ? 'selected' : ''}`}
                        disabled={isBooked || isLoadingSlots || isPast}
                        onClick={() => setNewTime(slot)}
                        style={isCurrentTime ? { borderColor: 'rgba(197, 168, 128, 0.4)' } : {}}
                        title={isCurrentTime ? 'Jadwal saat ini' : isPast ? 'Waktu sudah lewat' : isBooked ? 'Sudah dipesan' : 'Tersedia'}
                      >
                        {slot} {isCurrentTime && '*'}
                      </button>
                    );
                  })}
                </div>
                {activeReschedule.booking_date === newDate && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                    * Tanda bintang menunjukkan jadwal Anda saat ini.
                  </span>
                )}
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
                Kembali
              </button>
              <button 
                type="button" 
                className="btn" 
                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                onClick={handleSaveReschedule}
                disabled={isSavingReschedule || isLoadingSlots || !newTime}
              >
                {isSavingReschedule ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

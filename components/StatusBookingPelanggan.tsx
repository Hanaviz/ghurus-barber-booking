"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

import { TIME_SLOTS, isSlotPast } from '@/lib/config';
import StatusSearch from './status/StatusSearch';
import BookingList from './status/BookingList';
import RescheduleModal from './status/RescheduleModal';

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
  
  interface BookedSlot {
    time: string;
    name: string;
  }
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
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
          .select('booking_time, name')
          .eq('booking_date', newDate)
          .neq('status', 'Batal');

        if (error) throw error;

        if (data) {
          const slots: BookedSlot[] = data.map((item: any) => {
            const timeStr = item.booking_time;
            return {
              time: timeStr ? timeStr.substring(0, 5).replace(':', '.') : '',
              name: item.name
            };
          }).filter(slot => slot.time !== '');
          
          const currentFormattedTime = activeReschedule.booking_time.substring(0, 5).replace(':', '.');
          if (newDate === activeReschedule.booking_date) {
            const filteredSlots = slots.filter(s => s.time !== currentFormattedTime);
            setBookedSlots(filteredSlots);
          } else {
            setBookedSlots(slots);
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

      <BookingList 
        bookings={bookings}
        formatDateIndo={formatDateIndo}
        getStatusBadge={getStatusBadge}
        openRescheduleModal={openRescheduleModal}
        handleCancelBooking={handleCancelBooking}
      />

      {activeReschedule && (
        <RescheduleModal 
          activeReschedule={activeReschedule}
          newDate={newDate}
          setNewDate={setNewDate}
          newTime={newTime}
          setNewTime={setNewTime}
          bookedSlots={bookedSlots}
          isLoadingSlots={isLoadingSlots}
          isSavingReschedule={isSavingReschedule}
          TIME_SLOTS={TIME_SLOTS}
          handleDateClick={handleDateClick}
          isSlotPast={isSlotPast}
          handleSaveReschedule={handleSaveReschedule}
          closeModal={() => setActiveReschedule(null)}
          getTodayString={getTodayString}
        />
      )}
    </div>
  );
}

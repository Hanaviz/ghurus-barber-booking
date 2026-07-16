"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

import { TIME_SLOTS, isSlotPast } from '@/lib/config';
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
  
  interface BookedSlot {
    time: string;
    name: string;
  }

  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
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
          .select('booking_time, name')
          .eq('booking_date', date)
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
          setBookedSlots(slots);
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
      setBookedSlots(prev => [
        ...prev, 
        { time: selectedTime, name: name.trim() }
      ]);
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
          setDate={setDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          bookedSlots={bookedSlots}
          isLoadingSlots={isLoadingSlots}
          isSubmitting={isSubmitting}
          isEnvConfigured={isEnvConfigured}
          message={message}
          handleSubmit={handleSubmit}
          handleDateClick={handleDateClick}
          isSlotPast={isSlotPast}
          TIME_SLOTS={TIME_SLOTS}
        />
      )}
    </div>
  );
}

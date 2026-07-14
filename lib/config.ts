// Konfigurasi Slot Waktu Booking Barbershop
// Estimasi pangkas rambut: 30 menit per orang.
// Jam Operasional: Dua Sesi (Sesi 1: 14.00 - 18.00 WIB & Sesi 2: 19.30 - 00.00 WIB)
// Format penulisan jam menggunakan format Indonesia dengan tanda titik (.).

export const TIME_SLOTS = [
  // Sesi 1 (14.00 - 18.00 WIB)
  "14.00",
  "14.30",
  "15.00",
  "15.30",
  "16.00",
  "16.30",
  "17.00",
  "17.30",
  
  // Sesi 2 (19.30 - 00.00 WIB)
  "19.30",
  "20.00",
  "20.30",
  "21.00",
  "21.30",
  "22.00",
  "22.30",
  "23.00",
  "23.30"
];

/**
 * Memeriksa apakah slot waktu pada tanggal tertentu sudah terlewati dibanding waktu lokal sekarang.
 * Berguna agar pelanggan tidak bisa memesan jam yang sudah lewat.
 */
export const isSlotPast = (slotDate: string, slotTime: string): boolean => {
  if (!slotDate || !slotTime) return false;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Jika tanggal yang dipilih sebelum hari ini, berarti sudah lewat
  if (slotDate < todayStr) {
    return true;
  }

  // Jika tanggal yang dipilih adalah hari ini, bandingkan jam & menitnya
  if (slotDate === todayStr) {
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    const [slotHours, slotMinutes] = slotTime.split('.').map(Number); // memisahkan dengan tanda titik (.)

    if (slotHours < currentHours) {
      return true;
    }
    if (slotHours === currentHours && slotMinutes <= currentMinutes) {
      return true;
    }
  }

  return false;
};

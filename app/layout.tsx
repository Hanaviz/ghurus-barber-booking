import type { Metadata } from "next";
import "./globals.css";
import NavigasiBar from "@/components/NavigasiBar";

export const metadata: Metadata = {
  title: "Ghurus Barber Clinic - Booking Pangkas Rambut Online",
  description: "Pesan jadwal pangkas rambut Anda dengan mudah, cepat, dan tanpa antrean. Solusi anti-double booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="app-container">
          <NavigasiBar />

          <main className="main-content">
            {children}
          </main>

          <footer className="footer">
            <div className="footer-grid">
              {/* Column 1: Brand and Socials */}
              <div className="footer-col">
                <div className="footer-brand-title">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', display: 'inline-block', verticalAlign: 'middle' }}>
                    <circle cx="6" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <line x1="9.8" y1="8.2" x2="21" y2="19.4"></line>
                    <line x1="9.8" y1="15.8" x2="21" y2="4.6"></line>
                  </svg>
                  <span>Ghurus Barber Clinic</span>
                </div>
                <p className="footer-brand-desc hide-on-mobile">
                  Gaya maksimal, booking tanpa antre. Dapatkan pelayanan pangkas rambut eksklusif dan terbaik dari barber profesional kami.
                </p>
                <div className="footer-mobile-only-info show-on-mobile-only">
                  <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 500 }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    WA: 0813-7451-3857
                  </p>
                </div>
                <div className="footer-socials">
                  <a href="https://instagram.com/ghurus_barber" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Instagram">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://wa.me/6281374513857" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="WhatsApp">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M17.472 14.382c-.022-.08-.5-.2-.75-.3-.25-.1-.5-.15-.75-.15s-.5.05-.75.15c-.25.1-1 .85-1.15 1-.15.15-.3.15-.55.05a7.65 7.65 0 0 1-2.228-1.378 7.373 7.373 0 0 1-1.542-1.918c-.1-.2-.025-.3.075-.4.075-.075.15-.175.225-.25.075-.075.1-.175.15-.25s-.025-.4-.125-.65c-.1-.25-.6-1.5-.825-2.05-.225-.55-.45-.45-.625-.45-.175 0-.375-.025-.575-.025s-.45.075-.675.325c-.225.25-.875.85-.875 2.075s.9 2.4 1 2.55c.1.15 1.775 2.7 4.3 3.8.6.25 1.075.4 1.45.525.6.2 1.15.175 1.575.1.475-.075 1.45-.6 1.65-1.175.2-.575.2-1.075.15-1.175zM12 2a10 10 0 0 0-8.584 15.18L2 22l5.002-1.314A9.957 9.957 0 0 0 12 22a10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18a7.95 7.95 0 0 1-4.086-1.127l-.293-.17-3.04.8 1.143-2.92-.19-.3A7.957 7.957 0 0 1 4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Column 2: Opening Hours */}
              <div className="footer-col hide-on-mobile">
                <h4 className="footer-col-title">Jam Buka</h4>
                <ul className="footer-info-list">
                  <li className="footer-info-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>Setiap Hari (Senin - Minggu)</span>
                  </li>
                </ul>
              </div>

              {/* Column 3: Contact & Location */}
              <div className="footer-col hide-on-mobile">
                <h4 className="footer-col-title">Hubungi Kami</h4>
                <ul className="footer-info-list">
                  <li className="footer-info-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>Sumatera Barat, Indonesia</span>
                  </li>
                  <li className="footer-info-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <a href="https://wa.me/6281374513857" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      0813-7451-3857
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom-bar">
              <p>&copy; {new Date().getFullYear()} Ghurus Barber Clinic. All rights reserved.</p>
              <div className="footer-bottom-links hide-on-mobile">
                <a href="/admin" className="footer-bottom-link">Admin Portal</a>
                <a href="/" className="footer-bottom-link">Booking Baru</a>
                <a href="/booking-status" className="footer-bottom-link">Cek Status</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

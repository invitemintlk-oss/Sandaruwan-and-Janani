import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, VolumeX, Heart } from 'lucide-react';
import { Toaster } from 'sonner';

import { EnvelopeOpening } from './components/EnvelopeOpening';
import { Hero } from './components/Hero';
import { CoupleDetails } from './components/CoupleDetails';
import { CeremonyDetails } from './components/CeremonyDetails';
import { Location } from './components/Location';
import { Timeline } from './components/Timeline';
import { Gallery } from './components/Gallery';
import { Countdown } from './components/Countdown';
import { RSVPForm } from './components/RSVPForm';
import { AdminPage } from './components/AdminPage';
import { WEDDING, MUSIC_URL, getGuestFromPath } from './config';
import { WishesSection } from './components/WishesSection';

export default function App() {
  const isAdmin = window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/admin';
  if (isAdmin) return <AdminPage />;
  return <Invitation />;
}

function Invitation() {
  const guestName = getGuestFromPath(window.location.pathname);
  const [showInvitation, setShowInvitation] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    audioRef.current.preload = 'auto';

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleMusicStart = () => {
    setIsMusicPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  if (!showInvitation) {
    return (
      <EnvelopeOpening
        onComplete={() => setShowInvitation(true)}
        onMusicStart={handleMusicStart}
        guestName={guestName}
      />
    );
  }

  // Set the wedding date for the countdown
  const weddingDate = WEDDING.date;

  return (
    <div className="font-sans text-stone-800 bg-brand-ivory overflow-hidden selection:bg-brand-beige-deep/20">
      <Toaster position="top-center" />
      
      {/* Premium Floating Music Toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={toggleMusic}
        className="fixed top-6 right-6 z-50 w-12 sm:w-14 h-12 sm:h-14 bg-white/70 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(180,90,64,0.2)] flex items-center justify-center border border-brand-beige/50 text-brand-beige-deep hover:scale-105 transition-all duration-300"
      >
        {isMusicPlaying ? <Music className="w-5 h-5 sm:w-6 sm:h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />}
      </motion.button>

      <Hero guestName={guestName} />
      
      <div className="py-24 sm:py-32 bg-gradient-to-b from-brand-ivory via-brand-sand to-brand-ivory relative">
        <CoupleDetails />
      </div>

      <div className="py-24 sm:py-32 bg-white relative">
        <CeremonyDetails />
      </div>

      <div className="py-24 sm:py-32 bg-gradient-to-b from-brand-sand via-brand-champagne/60 to-brand-ivory relative">
        <Location />
      </div>

      <div className="py-24 sm:py-32 bg-brand-ivory relative">
        <Timeline />
      </div>

      <div className="py-24 sm:py-32 bg-white relative">
        <Gallery />
      </div>

      <div className="py-24 sm:py-32 bg-gradient-to-b from-brand-sand to-brand-ivory relative">
          <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
            <span className="text-brand-beige-deep uppercase tracking-[0.4em] text-[10px] sm:text-[11px] font-bold drop-shadow-sm">
              The Wait Is Almost Over
            </span>
          </div>
          <Countdown targetDate={weddingDate} />
      </div>

      <div className="py-24 sm:py-32 bg-brand-ivory relative">
        <RSVPForm />
      </div>

      <div className="py-24 sm:py-32 bg-gradient-to-b from-brand-ivory to-brand-sand relative">
        <WishesSection />
      </div>

      {/* Elegant Footer Signature */}
      <footer className="py-14 px-4 bg-gradient-to-b from-[#5a3326] to-[#3a1f17] text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-beige/20 blur-[90px] rounded-full pointer-events-none" />
        <Heart className="relative w-6 h-6 mx-auto mb-6 text-brand-beige fill-brand-beige/30" />
        <p className="relative font-display text-4xl sm:text-5xl text-brand-champagne mb-2">{WEDDING.groomName} & {WEDDING.brideName}</p>
        <span className="relative text-[10px] sm:text-[11px] uppercase tracking-[0.4em] font-sans text-brand-gold-light/80 font-semibold block mb-8">
          December 24, 2026
        </span>
        <div className="relative w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mx-auto mb-4" />
        <p className="relative text-[#D4AF37] text-xs mt-2 font-sans tracking-wider">
          Want a beautiful wedding website like this? Create yours with{' '}
          <a target="_blank" rel="noreferrer" className="text-white hover:text-[#D4AF37] underline" href="https://wa.me/94707819074">
            invitemint
          </a>
        </p>
      </footer>
    </div>
  );
}
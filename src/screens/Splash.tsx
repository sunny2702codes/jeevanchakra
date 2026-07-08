import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

interface SplashProps {
  onDone: () => void;
}

export default function Splash({ onDone }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #3b1162 50%, #4C1D95 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 42%, rgba(140,92,246,0.28) 0%, transparent 65%)' }}
        />

        <motion.div
          className="flex flex-col items-center gap-0 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Logo size="splash" showText={false} dark />

          <div className="mt-6 text-center">
            <div className="text-4xl font-bold tracking-tight select-none">
              <span className="text-white">Jeevan</span>
              <span className="text-jc-gold-400">Chakra</span>
            </div>
            <div className="mt-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Classical Homeopathy Decision Support
            </div>
          </div>

          {/* Gold spinner */}
          <motion.div
            className="mt-10 w-6 h-6 rounded-full border-2"
            style={{ borderColor: 'rgba(253,211,77,0.3)', borderTopColor: '#FCD34D' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

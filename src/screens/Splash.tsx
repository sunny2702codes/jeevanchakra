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
    }, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="flex flex-col items-center gap-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Large centered logo SVG — no inline text */}
          <Logo size="splash" showText={false} />

          {/* Title below the animated SVG */}
          <div className="mt-5 text-center">
            <div className="text-4xl font-bold tracking-tight select-none">
              <span className="text-jc-purple-700">Jeevan</span>
              <span className="text-jc-gold-600">Chakra</span>
            </div>
            <div className="text-slate-400 text-sm mt-1">Intelligent Homeopathy, Personalized Care.</div>
          </div>

          {/* Spinner */}
          <motion.div
            className="mt-8 w-6 h-6 rounded-full border-2 border-jc-purple-200 border-t-jc-purple-700"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

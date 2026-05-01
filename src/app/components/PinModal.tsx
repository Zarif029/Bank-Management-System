import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Delete, Lock, ShieldAlert } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
  actionType: 'deposit' | 'withdraw' | 'send';
  amount: number;
  /** Shown for send / transfer */
  recipientName?: string;
}

export function PinModal({ isOpen, onClose, onSuccess, correctPin, actionType, amount, recipientName }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const handleKeyPress = (key: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + key;
    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      setTimeout(() => {
        if (newPin === correctPin) {
          setPin('');
          setError('');
          onSuccess();
        } else {
          setError('Incorrect PIN. Please try again.');
          setShakeKey((k) => k + 1);
          setTimeout(() => setPin(''), 400);
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-80 rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-primary to-orange-400" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}
                  >
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontSize: '0.95rem' }}>Verify Secret PIN</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {actionType === 'send' ? (
                        <>
                          Authorize{' '}
                          <span className="text-orange-500" style={{ fontWeight: 600 }}>
                            transfer
                          </span>{' '}
                          of{' '}
                          <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                            ₹{amount.toLocaleString('en-IN')}
                          </span>{' '}
                          to <span style={{ fontWeight: 600 }}>{recipientName ?? 'Recipient'}</span>
                        </>
                      ) : (
                        <>
                          Authorize{' '}
                          <span
                            className={actionType === 'deposit' ? 'text-green-500' : 'text-red-500'}
                            style={{ fontWeight: 600 }}
                          >
                            {actionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                          </span>{' '}
                          of{' '}
                          <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                            ₹{amount.toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* PIN dots */}
              <motion.div
                key={shakeKey}
                animate={shakeKey > 0 ? { x: [-10, 10, -10, 10, -6, 6, 0] } : {}}
                transition={{ duration: 0.35 }}
                className="flex justify-center gap-5 mb-4"
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i < pin.length ? 1.2 : 1,
                      backgroundColor:
                        i < pin.length
                          ? error
                            ? '#ef4444'
                            : 'var(--primary)'
                          : 'var(--border)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-3.5 h-3.5 rounded-full"
                  />
                ))}
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-destructive text-xs mb-3 justify-center"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2.5">
                {keys.map((key, i) =>
                  key === '' ? (
                    <div key={i} />
                  ) : key === 'del' ? (
                    <motion.button
                      key="del"
                      whileTap={{ scale: 0.92 }}
                      onClick={handleDelete}
                      className="h-14 rounded-2xl flex items-center justify-center transition-colors"
                      style={{ background: 'var(--secondary)' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          'color-mix(in srgb, #ef4444 15%, var(--secondary))')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')
                      }
                    >
                      <Delete className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleKeyPress(key)}
                      className="h-14 rounded-2xl text-lg transition-all"
                      style={{
                        background: 'var(--secondary)',
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          'color-mix(in srgb, var(--primary) 20%, var(--secondary))')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')
                      }
                    >
                      {key}
                    </motion.button>
                  )
                )}
              </div>


            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

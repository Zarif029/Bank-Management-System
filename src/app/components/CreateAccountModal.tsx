import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Lock, Banknote, CreditCard, CheckCircle } from 'lucide-react';

export interface CreateAccountData {
  name: string;
  accountType: 'savings' | 'current';
  initialBalance: number;
  pin: string;
}

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountData) => void;
}

export function CreateAccountModal({ isOpen, onClose, onSubmit }: CreateAccountModalProps) {
  const [formData, setFormData] = useState<CreateAccountData>({
    name: '',
    accountType: 'savings',
    initialBalance: 0,
    pin: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) e.name = 'Full name must be at least 3 characters';
    if (formData.initialBalance < 0) e.initialBalance = 'Balance cannot be negative';
    if (!/^\d{4}$/.test(formData.pin)) e.pin = 'PIN must be exactly 4 digits';
    return e;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFormData({ name: '', accountType: 'savings', initialBalance: 0, pin: '' });
      setErrors({});
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setFormData({ name: '', accountType: 'savings', initialBalance: 0, pin: '' });
    setErrors({});
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-primary to-orange-300" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Create New Account</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details to open a new bank account
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-10"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.4 }}
                      className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                    >
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </motion.div>
                    <p className="font-semibold text-green-600 dark:text-green-400">Account Created!</p>
                    <p className="text-sm text-muted-foreground text-center">
                      {formData.name}'s account has been successfully created.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="e.g. Arjun Mehta"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            setErrors({ ...errors, name: '' });
                          }}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                          style={{
                            background: 'var(--input-background)',
                            borderColor: errors.name ? 'var(--destructive)' : 'var(--input)',
                          }}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-destructive mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1.5">Account Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['savings', 'current'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setFormData({ ...formData, accountType: type })}
                            className="py-3 rounded-xl border-2 transition-all capitalize flex items-center justify-center gap-2"
                            style={{
                              borderColor:
                                formData.accountType === type ? 'var(--primary)' : 'var(--border)',
                              background:
                                formData.accountType === type
                                  ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                                  : 'transparent',
                              color:
                                formData.accountType === type ? 'var(--primary)' : 'var(--foreground)',
                              fontWeight: 600,
                            }}
                          >
                            <CreditCard className="w-4 h-4" />
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Initial Balance */}
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1.5">
                        Initial Deposit (₹)
                      </label>
                      <div className="relative">
                        <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          value={formData.initialBalance || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              initialBalance: parseFloat(e.target.value) || 0,
                            });
                            setErrors({ ...errors, initialBalance: '' });
                          }}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                          style={{
                            background: 'var(--input-background)',
                            borderColor: errors.initialBalance
                              ? 'var(--destructive)'
                              : 'var(--input)',
                          }}
                        />
                      </div>
                      {errors.initialBalance && (
                        <p className="text-xs text-destructive mt-1">{errors.initialBalance}</p>
                      )}
                    </div>

                    {/* PIN */}
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1.5">
                        Set 4-Digit Secret PIN
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="••••"
                          maxLength={4}
                          value={formData.pin}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              pin: e.target.value.replace(/\D/g, '').slice(0, 4),
                            });
                            setErrors({ ...errors, pin: '' });
                          }}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                          style={{
                            background: 'var(--input-background)',
                            borderColor: errors.pin ? 'var(--destructive)' : 'var(--input)',
                          }}
                        />
                      </div>
                      {errors.pin && (
                        <p className="text-xs text-destructive mt-1">{errors.pin}</p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleClose}
                        className="flex-1 py-3 rounded-xl transition-colors hover:bg-accent"
                        style={{ background: 'var(--secondary)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="flex-1 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, #ff6b35, #e85000)',
                          fontWeight: 600,
                        }}
                      >
                        Create Account
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { User, ChevronDown, ShieldCheck, Crown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface UserProfile {
  id: string;
  name: string;
  accountNumber: string;
  accountType: 'savings' | 'current';
  balance: number;
  pin: string;
  interestRate?: number;
  overdraftLimit?: number;
}

interface ProfileSwitcherProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

export function ProfileSwitcher({ users, currentUser, onUserChange }: ProfileSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = currentUser.id === 'admin';

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all"
        style={{
          background: 'var(--secondary)',
          border: '1px solid var(--border)',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')
        }
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: isAdmin
              ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
              : 'linear-gradient(135deg, #ff6b35, #e85000)',
          }}
        >
          {isAdmin ? (
            <Crown className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser.name}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute top-full mt-2 right-0 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-3 py-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  Switch Profile
                </p>
                {users.map((user) => {
                  const isActive = user.id === currentUser.id;
                  const isAdminUser = user.id === 'admin';
                  return (
                    <motion.button
                      key={user.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onUserChange(user);
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-3 rounded-xl text-left flex items-center gap-3 transition-all"
                      style={{
                        background: isActive
                          ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.background = 'var(--secondary)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isAdminUser
                            ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                            : 'linear-gradient(135deg, #ff6b35, #e85000)',
                        }}
                      >
                        {isAdminUser ? (
                          <Crown className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isAdminUser ? 'Administrator' : `A/C: ${user.accountNumber}`}
                        </p>
                      </div>
                      {isActive && (
                        <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

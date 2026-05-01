import { useState } from 'react';
import { Plus, User, Crown, Shield, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from './ProfileSwitcher';
import { CreateAccountModal, CreateAccountData } from './CreateAccountModal';

interface AdminDashboardProps {
  users: UserProfile[];
  onCreateAccount: (data: CreateAccountData) => void;
}

export function AdminDashboard({ users, onCreateAccount }: AdminDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const savingsCount = users.filter((u) => u.accountType === 'savings').length;
  const currentCount = users.filter((u) => u.accountType === 'current').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1>Administrator Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage all customer accounts
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-white transition-all hover:opacity-90 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ff6b35, #e85000)',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(255, 107, 53, 0.35)',
          }}
        >
          <Plus className="w-5 h-5" />
          Create New Account
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Accounts',
            value: users.length,
            icon: Users,
            color: '#ff6b35',
            bg: 'color-mix(in srgb, #ff6b35 12%, transparent)',
          },
          {
            label: 'Total Deposits',
            value: `₹${totalBalance.toLocaleString('en-IN')}`,
            icon: TrendingUp,
            color: '#16a34a',
            bg: 'color-mix(in srgb, #16a34a 12%, transparent)',
          },
          {
            label: 'Savings / Current',
            value: `${savingsCount} / ${currentCount}`,
            icon: Shield,
            color: '#7c3aed',
            bg: 'color-mix(in srgb, #7c3aed 12%, transparent)',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: stat.bg }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5" style={{ fontWeight: 700, fontSize: '1.15rem' }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Accounts Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="px-6 py-4 border-b flex items-center gap-2"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3>All Accounts</h3>
          <span
            className="text-xs px-2.5 py-1 rounded-full ml-1"
            style={{
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
              fontWeight: 700,
            }}
          >
            {users.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                <th className="px-6 py-3.5 text-left text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
                  #
                </th>
                <th className="px-6 py-3.5 text-left text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
                  Account Number
                </th>
                <th className="px-6 py-3.5 text-left text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
                  Account Holder
                </th>
                <th className="px-6 py-3.5 text-left text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
                  Account Type
                </th>
                <th className="px-6 py-3.5 text-right text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'transparent')
                  }
                >
                  <td className="px-6 py-4 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="px-6 py-4">
                    <span
                      className="font-mono text-sm px-2.5 py-1 rounded-lg"
                      style={{
                        background: 'var(--secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {user.accountNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #ff6b35, #e85000)',
                          fontWeight: 700,
                        }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm px-3 py-1 rounded-full capitalize"
                      style={{
                        background:
                          user.accountType === 'savings'
                            ? 'color-mix(in srgb, #16a34a 12%, transparent)'
                            : 'color-mix(in srgb, #7c3aed 12%, transparent)',
                        color: user.accountType === 'savings' ? '#16a34a' : '#7c3aed',
                        fontWeight: 600,
                      }}
                    >
                      {user.accountType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      ₹{user.balance.toLocaleString('en-IN')}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No accounts yet. Create the first one!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateAccount}
      />
    </div>
  );
}

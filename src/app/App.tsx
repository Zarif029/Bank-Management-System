import { useState } from 'react';
import { CirclePlus, LogOut, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from './components/ThemeToggle';
import { UserProfile } from './components/ProfileSwitcher';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Transaction } from './components/TransactionHistory';
import { CreateAccountData, CreateAccountModal } from './components/CreateAccountModal';
import { IstTime } from './components/IstTime';
import { DigibankLogo } from './components/DigibankLogo';
import { useLocalStorage } from './hooks/useLocalStorage';

const istTxDate = () =>
  new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const initialDemoPeerTransactions: Record<string, Transaction[]> = {
  '1': [
    {
      id: 'demo-recv-1',
      type: 'receive',
      amount: 2500,
      date: istTxDate(),
      description: 'From Priya Sharma',
      senderName: 'Priya Sharma',
      receiverName: 'Rajesh Kumar',
    },
  ],
  '2': [
    {
      id: 'demo-send-1',
      type: 'send',
      amount: 2500,
      date: istTxDate(),
      description: 'Send to Rajesh Kumar',
      senderName: 'Priya Sharma',
      receiverName: 'Rajesh Kumar',
    },
  ],
};

const initialUsers: UserProfile[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    accountNumber: '1001',
    accountType: 'savings',
    balance: 45000,
    pin: '1234',
    interestRate: 4.5,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    accountNumber: '1002',
    accountType: 'current',
    balance: 125000,
    pin: '5678',
    overdraftLimit: 50000,
  },
  {
    id: '3',
    name: 'Amit Patel',
    accountNumber: '1003',
    accountType: 'savings',
    balance: 78500,
    pin: '9012',
    interestRate: 4.5,
  },
  {
    id: 'admin',
    name: 'Administrator',
    accountNumber: 'admin',
    accountType: 'current',
    balance: 0,
    pin: '0000',
  },
];

export default function App() {
  const [users, setUsers] = useLocalStorage<UserProfile[]>('nv_users_v2', initialUsers);
  const [userTransactions, setUserTransactions] = useLocalStorage<Record<string, Transaction[]>>(
    'nv_transactions_v2',
    initialDemoPeerTransactions
  );

  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('nv_isLoggedIn_v2', false);
  const [currentUser, setCurrentUser] = useLocalStorage<UserProfile | null>('nv_currentUser_v2', null);

  // Login form state
  const [loginAcc, setLoginAcc] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Create account state
  const [isCreatingAccount, setIsCreatingAccount] = useState(true);
  const [openAccountData, setOpenAccountData] = useState<CreateAccountData>({
    name: '',
    accountType: 'savings',
    initialBalance: 0,
    pin: '',
  });
  const [openAccountErrors, setOpenAccountErrors] = useState<Record<string, string>>({});

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const isAdmin = currentUser?.id === 'admin';
  const syncedCurrentUser = currentUser ? (users.find((u) => u.id === currentUser.id) ?? currentUser) : null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = users.find((u) => u.accountNumber === loginAcc && u.pin === loginPin);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      toast.success(`Welcome back, ${user.name}!`);
      setLoginAcc('');
      setLoginPin('');
    } else {
      setLoginError('Invalid Account Number or PIN.');
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    toast.info('You have been logged out.');
  };

  const handleBalanceChange = (userId: string, newBalance: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, balance: newBalance } : u))
    );
  };

  const handleAddTransaction = (userId: string, tx: Transaction) => {
    setUserTransactions((prev) => ({
      ...prev,
      [userId]: [tx, ...(prev[userId] ?? [])],
    }));
  };

  const handlePeerTransfer = (toUserId: string, amount: number) => {
    if (!syncedCurrentUser) return;
    const fromId = syncedCurrentUser.id;
    const from = users.find((u) => u.id === fromId);
    const to = users.find((u) => u.id === toUserId);
    if (!from || !to) return;
    if (from.id === 'admin' || to.id === 'admin' || fromId === toUserId) return;
    if (from.balance < amount) {
      toast.error('Insufficient balance for transfer.');
      return;
    }

    const baseId = `t${Date.now()}`;
    const dateStr = istTxDate();
    const outTx: Transaction = {
      id: `${baseId}-o`,
      type: 'send',
      amount,
      date: dateStr,
      description: `Send to ${to.name}`,
      senderName: from.name,
      receiverName: to.name,
    };
    const inTx: Transaction = {
      id: `${baseId}-i`,
      type: 'receive',
      amount,
      date: dateStr,
      description: `From ${from.name}`,
      senderName: from.name,
      receiverName: to.name,
    };
    
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === fromId) return { ...u, balance: u.balance - amount };
        if (u.id === toUserId) return { ...u, balance: u.balance + amount };
        return u;
      })
    );
    setUserTransactions((ut) => ({
      ...ut,
      [fromId]: [outTx, ...(ut[fromId] ?? [])],
      [toUserId]: [inTx, ...(ut[toUserId] ?? [])],
    }));
    
    toast.success(`Successfully transferred ₹${amount.toLocaleString('en-IN')} to ${to.name}`);
  };

  const handleCreateAccount = (data: CreateAccountData) => {
    const customerCount = users.filter((u) => u.id !== 'admin').length;
    const newAccountNumber = (1000 + customerCount + 1).toString();
    const newUser: UserProfile = {
      id: Date.now().toString(),
      name: data.name,
      accountNumber: newAccountNumber,
      accountType: data.accountType,
      balance: data.initialBalance,
      pin: data.pin,
      interestRate: data.accountType === 'savings' ? 4.5 : undefined,
      overdraftLimit: data.accountType === 'current' ? 50000 : undefined,
    };
    setUsers((prev) => {
      const withoutAdmin = prev.filter((u) => u.id !== 'admin');
      const admin = prev.find((u) => u.id === 'admin')!;
      return [...withoutAdmin, newUser, admin];
    });
    return newUser;
  };

  const validateOpenAccount = () => {
    const e: Record<string, string> = {};
    if (!openAccountData.name.trim() || openAccountData.name.trim().length < 3) {
      e.name = 'Full name must be at least 3 characters';
    }
    if (openAccountData.initialBalance < 0) {
      e.initialBalance = 'Amount cannot be negative';
    }
    if (!/^\d{4}$/.test(openAccountData.pin)) {
      e.pin = 'PIN must be exactly 4 digits';
    }
    return e;
  };

  const handleOpenAccountSubmit = () => {
    const validationErrors = validateOpenAccount();
    if (Object.keys(validationErrors).length > 0) {
      setOpenAccountErrors(validationErrors);
      return;
    }
    const createdUser = handleCreateAccount(openAccountData);
    setCurrentUser(createdUser);
    setIsLoggedIn(true);
    setIsCreatingAccount(false);
    setOpenAccountErrors({});
    toast.success(`Account created! Your Account Number is ${createdUser.accountNumber}`);
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn || !syncedCurrentUser) {
    if (isCreatingAccount) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6" style={{ background: 'var(--background)' }}>
          <div className="w-full max-w-xl rounded-3xl p-7 sm:p-9" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 28px color-mix(in srgb, var(--primary) 15%, transparent)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px color-mix(in srgb, var(--primary) 12%, transparent)' }}>
                  <DigibankLogo className="w-7 h-7" cutoutColor="var(--background)" />
                </div>
                <div>
                  <p className="leading-none" style={{ fontSize: '1rem', fontWeight: 700 }}>Digibank</p>
                  <p className="text-xs text-muted-foreground mt-1">Open an Account</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <IstTime />
                <ThemeToggle />
              </div>
            </div>
            
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Create New Account</h1>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Enter your details to create your account.</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Full Name</label>
                <input type="text" placeholder="e.g. Arjun Mehta" value={openAccountData.name} onChange={(e) => { setOpenAccountData((prev) => ({ ...prev, name: e.target.value })); setOpenAccountErrors((prev) => ({ ...prev, name: '' })); }} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all" style={{ background: 'var(--input-background)', borderColor: openAccountErrors.name ? 'var(--destructive)' : 'var(--input)' }} />
                {openAccountErrors.name && <p className="text-xs text-destructive mt-1">{openAccountErrors.name}</p>}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['savings', 'current'] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setOpenAccountData((prev) => ({ ...prev, accountType: type }))} className="py-3 rounded-xl border-2 transition-all capitalize" style={{ borderColor: openAccountData.accountType === type ? 'var(--primary)' : 'var(--border)', background: openAccountData.accountType === type ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent', color: openAccountData.accountType === type ? 'var(--primary)' : 'var(--foreground)', fontWeight: 600 }}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Initial Deposit (Amount)</label>
                <input type="number" min="0" placeholder="0" value={openAccountData.initialBalance || ''} onChange={(e) => { const value = parseFloat(e.target.value); setOpenAccountData((prev) => ({ ...prev, initialBalance: Number.isNaN(value) ? 0 : value })); setOpenAccountErrors((prev) => ({ ...prev, initialBalance: '' })); }} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all" style={{ background: 'var(--input-background)', borderColor: openAccountErrors.initialBalance ? 'var(--destructive)' : 'var(--input)' }} />
                {openAccountErrors.initialBalance && <p className="text-xs text-destructive mt-1">{openAccountErrors.initialBalance}</p>}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Set 4-Digit PIN</label>
                <input type="password" maxLength={4} placeholder="••••" value={openAccountData.pin} onChange={(e) => { setOpenAccountData((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })); setOpenAccountErrors((prev) => ({ ...prev, pin: '' })); }} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all" style={{ background: 'var(--input-background)', borderColor: openAccountErrors.pin ? 'var(--destructive)' : 'var(--input)' }} />
                {openAccountErrors.pin && <p className="text-xs text-destructive mt-1">{openAccountErrors.pin}</p>}
              </div>

              <button type="button" onClick={handleOpenAccountSubmit} className="w-full py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.99] mt-2" style={{ background: 'linear-gradient(135deg, var(--primary), #e85000)', fontWeight: 600 }}>
                Create Account
              </button>
              
              <button type="button" onClick={() => setIsCreatingAccount(false)} className="w-full py-3 rounded-xl transition-all hover:bg-secondary mt-2 text-muted-foreground" style={{ fontWeight: 600 }}>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-md rounded-3xl p-7 sm:p-9" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 28px color-mix(in srgb, var(--primary) 15%, transparent)' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px color-mix(in srgb, var(--primary) 12%, transparent)' }}>
                <DigibankLogo className="w-8 h-8" cutoutColor="var(--background)" />
              </div>
              <div>
                <p className="leading-none" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Digibank</p>
                <p className="text-xs text-muted-foreground mt-1">Secure Login</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Account Number</label>
              <input type="text" placeholder="e.g. 1001" value={loginAcc} onChange={(e) => setLoginAcc(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary transition-all" style={{ background: 'var(--input-background)', borderColor: 'var(--input)' }} required />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">4-Digit PIN</label>
              <input type="password" maxLength={4} placeholder="••••" value={loginPin} onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary transition-all" style={{ background: 'var(--input-background)', borderColor: 'var(--input)' }} required />
            </div>

            {loginError && <p className="text-sm text-destructive">{loginError}</p>}

            <button type="submit" className="w-full py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, var(--primary), #e85000)', fontWeight: 600 }}>
              Login Securely <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t flex flex-col items-center justify-center text-sm" style={{ borderColor: 'var(--border)' }}>
            <p className="text-muted-foreground mb-3">Don't have an account yet?</p>
            <button type="button" onClick={() => setIsCreatingAccount(true)} className="px-6 py-2 rounded-lg border font-medium hover:bg-secondary transition-colors" style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>
              Open an Account
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo Users: 1001 (1234) | 1002 (5678)<br/>Admin: admin (0000)
          </p>
          <button 
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-destructive transition-colors underline decoration-dotted underline-offset-2"
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    );
  }

  // --- LOGGED IN DASHBOARD ---
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 24px rgba(255, 107, 53, 0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px color-mix(in srgb, var(--primary) 12%, transparent)' }}>
              <DigibankLogo className="w-7 h-7" cutoutColor="var(--background)" />
            </div>
            <div>
              <h1 className="leading-none" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Digibank</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Welcome, {syncedCurrentUser.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            <IstTime />
            {isAdmin && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsQuickCreateOpen(true)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-secondary hover:bg-accent border" title="Add new account">
                <CirclePlus className="w-5 h-5 text-primary" />
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-secondary hover:bg-destructive/10 border group" title="Logout">
              <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
            </motion.button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />

      <main className="py-6 flex-grow">
        {isAdmin ? (
          <AdminDashboard users={users.filter((u) => u.id !== 'admin')} onCreateAccount={handleCreateAccount} />
        ) : (
          <CustomerDashboard
            key={syncedCurrentUser.id}
            userName={syncedCurrentUser.name}
            accountNumber={syncedCurrentUser.accountNumber}
            accountType={syncedCurrentUser.accountType}
            balance={syncedCurrentUser.balance}
            onBalanceChange={(nb) => handleBalanceChange(syncedCurrentUser.id, nb)}
            transactions={userTransactions[syncedCurrentUser.id] ?? []}
            onAddTransaction={(tx) => handleAddTransaction(syncedCurrentUser.id, tx)}
            transferPeers={users.filter((u) => u.id !== 'admin' && u.id !== syncedCurrentUser.id).map((u) => ({ id: u.id, name: u.name, accountNumber: u.accountNumber }))}
            onPeerTransfer={handlePeerTransfer}
            pin={syncedCurrentUser.pin}
            interestRate={syncedCurrentUser.interestRate}
            overdraftLimit={syncedCurrentUser.overdraftLimit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ background: 'var(--card)' }}>
              <DigibankLogo className="w-5 h-5" cutoutColor="var(--background)" />
            </div>
            <span className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>Digibank</span>
          </div>
          <p className="text-xs text-muted-foreground">LLT-1 Application Development Project &mdash; All rights reserved</p>
        </div>
      </footer>

      <CreateAccountModal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} onSubmit={(data) => { handleCreateAccount(data); setIsQuickCreateOpen(false); toast.success('Account created from Admin Panel!'); }} />
    </div>
  );
}

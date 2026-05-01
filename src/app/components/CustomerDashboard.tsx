import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  Shield,
  AlertCircle,
  Plus,
  Minus,
  Zap,
  Eye,
  EyeOff,
  Send,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedBalance } from './AnimatedBalance';
import { TransactionHistory, Transaction } from './TransactionHistory';
import { PinModal } from './PinModal';

interface TransferPeer {
  id: string;
  name: string;
  accountNumber: string;
}

interface CustomerDashboardProps {
  userName: string;
  accountNumber: string;
  accountType: 'savings' | 'current';
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  /** Other customer accounts to send money to (excludes self and admin) */
  transferPeers: TransferPeer[];
  onPeerTransfer: (toUserId: string, amount: number) => void;
  pin: string;
  interestRate?: number;
  overdraftLimit?: number;
}

export function CustomerDashboard({
  userName,
  accountNumber,
  accountType,
  balance,
  onBalanceChange,
  transactions,
  onAddTransaction,
  transferPeers,
  onPeerTransfer,
  pin,
  interestRate,
  overdraftLimit,
}: CustomerDashboardProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [sendToId, setSendToId] = useState(() => transferPeers[0]?.id ?? '');
  const [isSendAmountModalOpen, setIsSendAmountModalOpen] = useState(false);
  const [sendModalAmount, setSendModalAmount] = useState('');
  const [sendModalError, setSendModalError] = useState('');
  const [pendingAction, setPendingAction] = useState<{
    type: 'deposit' | 'withdraw' | 'send';
    amount: number;
    toUserId?: string;
    toName?: string;
  } | null>(null);
  const [deltaList, setDeltaList] = useState<{ id: number; value: number; positive: boolean }[]>([]);

  const quickAddAmounts = [500, 2500, 5000];
  const isAllowedAmount = (value: number) => value % 200 === 0 || value % 500 === 0;

  const txDate = () =>
    new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const transferPeerKey = transferPeers.map((p) => p.id).join(',');
  useEffect(() => {
    if (transferPeers.length === 0) {
      setSendToId('');
      return;
    }
    setSendToId((prev) => (prev && transferPeers.some((p) => p.id === prev) ? prev : transferPeers[0].id));
  }, [transferPeerKey]);

  const initiateDeposit = (depositAmount?: number) => {
    const value = depositAmount !== undefined ? depositAmount : parseFloat(amount);
    if (!value || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!isAllowedAmount(value)) {
      setError('Amount must be a multiple of 200 or 500');
      return;
    }
    setError('');
    setPendingAction({ type: 'deposit', amount: value });
  };

  const initiateWithdraw = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!isAllowedAmount(value)) {
      setError('Amount must be a multiple of 200 or 500');
      return;
    }
    if (value > balance) {
      setError('Insufficient balance for this withdrawal');
      return;
    }
    setError('');
    setPendingAction({ type: 'withdraw', amount: value });
  };

  const openSendAmountModal = () => {
    if (!sendToId) {
      setError('Select a recipient to send money');
      return;
    }
    setError('');
    setSendModalAmount('');
    setSendModalError('');
    setIsSendAmountModalOpen(true);
  };

  const closeSendAmountModal = () => {
    setIsSendAmountModalOpen(false);
    setSendModalAmount('');
    setSendModalError('');
  };

  const confirmSendAmount = () => {
    if (!sendToId) {
      setSendModalError('Select a recipient');
      return;
    }
    const value = parseFloat(sendModalAmount);
    if (!value || value <= 0) {
      setSendModalError('Please enter a valid amount');
      return;
    }
    if (!isAllowedAmount(value)) {
      setSendModalError('Amount must be a multiple of 200 or 500');
      return;
    }
    if (value > balance) {
      setSendModalError('Insufficient balance to send this amount');
      return;
    }
    const peer = transferPeers.find((p) => p.id === sendToId);
    if (!peer) {
      setSendModalError('Invalid recipient');
      return;
    }
    setSendModalError('');
    setIsSendAmountModalOpen(false);
    setSendModalAmount('');
    setPendingAction({ type: 'send', amount: value, toUserId: sendToId, toName: peer.name });
  };

  const handlePinVerified = () => {
    if (!pendingAction) return;
    const { type, amount: txAmount } = pendingAction;

    if (type === 'send' && pendingAction.toUserId) {
      if (txAmount > balance) {
        setError('Insufficient balance to send this amount');
        setPendingAction(null);
        return;
      }
      onPeerTransfer(pendingAction.toUserId, txAmount);
      const id = Date.now();
      setDeltaList((prev) => [...prev, { id, value: txAmount, positive: false }]);
      setTimeout(() => setDeltaList((prev) => prev.filter((d) => d.id !== id)), 2200);
      setAmount('');
      setPendingAction(null);
      return;
    }

    if (type === 'deposit') {
      const newBalance = balance + txAmount;
      onBalanceChange(newBalance);
      const id = Date.now();
      setDeltaList((prev) => [...prev, { id, value: txAmount, positive: true }]);
      setTimeout(() => setDeltaList((prev) => prev.filter((d) => d.id !== id)), 2200);
      onAddTransaction({
        id: id.toString(),
        type: 'deposit',
        amount: txAmount,
        date: txDate(),
        description: 'Cash deposit',
        senderName: 'Branch (cash in)',
        receiverName: userName,
      });
      setAmount('');
      toast.success(`Successfully deposited ₹${txAmount.toLocaleString('en-IN')}`);
    } else {
      if (txAmount > balance) {
        setError('Insufficient balance for this withdrawal');
        setPendingAction(null);
        return;
      }
      const newBalance = balance - txAmount;
      onBalanceChange(newBalance);
      const id = Date.now();
      setDeltaList((prev) => [...prev, { id, value: txAmount, positive: false }]);
      setTimeout(() => setDeltaList((prev) => prev.filter((d) => d.id !== id)), 2200);
      onAddTransaction({
        id: id.toString(),
        type: 'withdraw',
        amount: txAmount,
        date: txDate(),
        description: 'Cash withdrawal',
        senderName: userName,
        receiverName: 'Branch (cash out)',
      });
      setAmount('');
      toast.success(`Successfully withdrew ₹${txAmount.toLocaleString('en-IN')}`);
    }
    setPendingAction(null);
  };

  const handlePinClose = () => {
    setPendingAction(null);
  };

  const firstInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 space-y-5">
      {/* Welcome Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg"
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #e85000)',
              fontWeight: 700,
            }}
          >
            {firstInitial}
          </div>
          <div>
            <h1>Welcome back, {userName}</h1>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
            >
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary" style={{ fontWeight: 600 }}>
                A/C: {accountNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div
        className="relative rounded-3xl p-7 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #e85000 50%, #c94000 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-4 left-1/2 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-white/80" />
              <p className="text-white/80 text-sm" style={{ fontWeight: 500 }}>
                Current Balance
              </p>
            </div>
            <button
              onClick={() => setBalanceVisible((v) => !v)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Balance + delta */}
          <div className="relative inline-flex items-end gap-3 mt-1">
            <p className="text-5xl text-white" style={{ fontWeight: 800, letterSpacing: '-1px' }}>
              {balanceVisible ? (
                <>₹<AnimatedBalance value={balance} /></>
              ) : (
                <span style={{ letterSpacing: '4px' }}>₹ ••••••</span>
              )}
            </p>

            {/* Floating delta badges */}
            <div className="absolute -top-2 right-0 pointer-events-none">
              <AnimatePresence>
                {deltaList.map((delta) => (
                  <motion.span
                    key={delta.id}
                    initial={{ opacity: 1, y: 0, x: 0 }}
                    animate={{ opacity: 0, y: -50, x: 10 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="absolute whitespace-nowrap text-lg"
                    style={{
                      fontWeight: 700,
                      color: delta.positive ? '#86efac' : '#fca5a5',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {delta.positive ? '+' : '-'}₹{delta.value.toLocaleString('en-IN')}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span
              className="text-sm px-3 py-1 rounded-full capitalize"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              {accountType} Account
            </span>
            {accountType === 'savings' && interestRate && (
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 500 }}
              >
                {interestRate}% p.a. interest
              </span>
            )}
            {accountType === 'current' && overdraftLimit && (
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 500 }}
              >
                Overdraft: ₹{overdraftLimit.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add + Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account Info */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}
            >
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3>Account Details</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm text-muted-foreground">Account No.</span>
              <span className="font-mono text-sm" style={{ fontWeight: 600 }}>{accountNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm capitalize" style={{ fontWeight: 600 }}>{accountType}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Transactions</span>
              <span className="text-sm" style={{ fontWeight: 600 }}>{transactions.length} total</span>
            </div>
          </div>
        </div>

        {/* Quick Add */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}
            >
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3>Quick Deposit</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickAddAmounts.map((quickAmount) => (
              <motion.button
                key={quickAmount}
                whileTap={{ scale: 0.93 }}
                onClick={() => initiateDeposit(quickAmount)}
                className="py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: 'var(--secondary)',
                  fontWeight: 700,
                  color: 'var(--foreground)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--primary)';
                  (e.currentTarget as HTMLElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--secondary)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--foreground)';
                }}
              >
                +{quickAmount >= 1000 ? `${quickAmount / 1000}k` : quickAmount}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2.5 p-4 rounded-2xl overflow-hidden"
            style={{
              background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
              border: '1px solid var(--destructive)',
            }}
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive text-sm" style={{ fontWeight: 500 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Actions */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <h3 className="mb-4">Deposit / Withdraw</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Amount rule: enter values that are multiples of 200 or 500 only.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" style={{ fontWeight: 500 }}>
              ₹
            </span>
            <input
              type="number"
              step={500}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
              className="input-no-spin w-full pl-8 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              style={{
                background: 'var(--input-background)',
                borderColor: 'var(--input)',
              }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => initiateDeposit()}
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              fontWeight: 600,
            }}
          >
            <Plus className="w-5 h-5" />
            Deposit Funds
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={initiateWithdraw}
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              fontWeight: 600,
            }}
          >
            <Minus className="w-5 h-5" />
            Withdraw Funds
          </motion.button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          A secret PIN is required to authorize all transactions
        </p>
      </div>

      {/* Send to another customer */}
      {transferPeers.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, #ea580c 15%, transparent)' }}
            >
              <Send className="w-5 h-5" style={{ color: '#ea580c' }} />
            </div>
            <div>
              <h3>Send to another account</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a recipient, then tap Send money. You will enter the amount in a short step before
                confirming with your PIN.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Recipient</label>
              <select
                value={sendToId}
                onChange={(e) => {
                  setSendToId(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--input)',
                }}
              >
                {transferPeers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.accountNumber})
                  </option>
                ))}
              </select>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openSendAmountModal}
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-white transition-all w-full"
              style={{
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                fontWeight: 600,
              }}
            >
              <Send className="w-5 h-5" />
              Send money
            </motion.button>
          </div>
        </div>
      )}

      {/* Enter amount to send (before PIN) */}
      <AnimatePresence>
        {isSendAmountModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={closeSendAmountModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-primary to-orange-400" />
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'color-mix(in srgb, #ea580c 18%, transparent)' }}
                    >
                      <Send className="w-5 h-5" style={{ color: '#ea580c' }} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">Send money</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        To:{' '}
                        <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                          {transferPeers.find((p) => p.id === sendToId)?.name ?? '—'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeSendAmountModal}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  Amounts must be multiples of 200 or 500. Enter amount in rupees.
                </p>
                <div className="relative mb-1">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                    style={{ fontWeight: 500 }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    step={500}
                    autoFocus
                    placeholder="0"
                    value={sendModalAmount}
                    onChange={(e) => {
                      setSendModalAmount(e.target.value);
                      setSendModalError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && confirmSendAmount()}
                    onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                    className="input-no-spin w-full pl-8 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    style={{
                      background: 'var(--input-background)',
                      borderColor: sendModalError ? 'var(--destructive)' : 'var(--input)',
                    }}
                  />
                </div>
                {sendModalError && (
                  <p className="text-xs text-destructive mt-1 mb-3" style={{ fontWeight: 500 }}>
                    {sendModalError}
                  </p>
                )}

                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={closeSendAmountModal}
                    className="flex-1 py-3 rounded-xl transition-colors hover:bg-accent"
                    style={{ background: 'var(--secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmSendAmount}
                    className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}
                  >
                    Continue
                  </button>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Next step: verify with your 4-digit PIN
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TransactionHistory transactions={transactions} />

      {/* PIN Modal */}
      {pendingAction && (
        <PinModal
          isOpen={!!pendingAction}
          onClose={handlePinClose}
          onSuccess={handlePinVerified}
          correctPin={pin}
          actionType={pendingAction.type}
          amount={pendingAction.amount}
          recipientName={pendingAction.type === 'send' ? pendingAction.toName : undefined}
        />
      )}
    </div>
  );
}

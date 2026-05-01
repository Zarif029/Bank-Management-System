import { ArrowDownLeft, ArrowUpRight, Clock, Inbox, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'send' | 'receive';
  amount: number;
  date: string;
  description: string;
  /** Who sent the funds */
  senderName: string;
  /** Who received the funds */
  receiverName: string;
  /** @deprecated use senderName / receiverName */
  accountName?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const displayed = transactions.slice(0, 8);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <h3>Recent Transactions</h3>
          {transactions.length > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
                fontWeight: 700,
              }}
            >
              {transactions.length}
            </span>
          )}
        </div>
        {transactions.length > 8 && (
          <p className="text-xs text-muted-foreground">Showing last 8</p>
        )}
      </div>

      <div className="p-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
            <Clock className="w-10 h-10 opacity-30" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs opacity-70">Deposit, withdraw, or send money to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {displayed.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors"
                  style={{ background: 'var(--secondary)' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          tx.type === 'deposit' || tx.type === 'receive'
                            ? 'color-mix(in srgb, #16a34a 15%, transparent)'
                            : tx.type === 'send'
                              ? 'color-mix(in srgb, #ea580c 15%, transparent)'
                              : 'color-mix(in srgb, #dc2626 15%, transparent)',
                      }}
                    >
                      {tx.type === 'deposit' && (
                        <ArrowDownLeft className="w-4 h-4" style={{ color: '#16a34a' }} />
                      )}
                      {tx.type === 'withdraw' && (
                        <ArrowUpRight className="w-4 h-4" style={{ color: '#dc2626' }} />
                      )}
                      {tx.type === 'send' && (
                        <Send className="w-4 h-4" style={{ color: '#ea580c' }} />
                      )}
                      {tx.type === 'receive' && (
                        <Inbox className="w-4 h-4" style={{ color: '#16a34a' }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sender: {tx.senderName} → Receiver: {tx.receiverName}
                        <span className="opacity-70"> · {tx.date}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color:
                          tx.type === 'deposit' || tx.type === 'receive'
                            ? '#16a34a'
                            : tx.type === 'send'
                              ? '#ea580c'
                              : '#dc2626',
                      }}
                    >
                      {tx.type === 'deposit' || tx.type === 'receive' ? '+' : '-'}₹
                      {tx.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

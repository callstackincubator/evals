export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
  id: `tx-${i + 1}`,
  description: `Transaction ${i + 1}`,
  amount:
    Math.random() > 0.5
      ? Math.floor(Math.random() * 100) + 1
      : -(Math.floor(Math.random() * 100) + 1),
  type: Math.random() > 0.5 ? 'income' : 'expense',
  category: ['Food', 'Transport', 'Salary', 'Utilities'][
    Math.floor(Math.random() * 4)
  ],
  date: new Date(Date.now() - Math.random() * 10000000000)
    .toISOString()
    .split('T')[0],
}))

export const fetchTransactions = async (page: number, limit: number) => {
  const offset = (page - 1) * limit
  const filtered = MOCK_TRANSACTIONS.filter((tx) => true)
  const paginated = filtered.slice(offset, offset + limit)
  return { transactions: paginated, total: filtered.length }
}

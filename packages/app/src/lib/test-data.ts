import { PublicKey } from '@solana/web3.js'

export interface HumanCreditProfile {
  id: string
  name: string
  creditScore: number
  verifiedIncome: number
  employmentStatus: string
  description: string
}

export interface AgentCreditProfile {
  id: string
  wallet: string
  creditScore: number
  totalRevenue: number
  successRate: number
  operationalDays: number
  framework: 'ElizaOS' | 'AI16Z' | 'Custom'
  description: string
}

export interface MockCreditAnalysis {
  score: number
  summary: string
  strengths: string[]
  risks: string[]
  recommendation: 'Approve' | 'Review' | 'Deny'
}

export const TEST_HUMAN_PROFILES: HumanCreditProfile[] = [
  {
    id: 'human-excellent',
    name: 'Alice Johnson',
    creditScore: 782,
    verifiedIncome: 125000,
    employmentStatus: 'Senior Software Engineer',
    description: 'Excellent credit history, stable employment',
  },
  {
    id: 'human-good',
    name: 'Bob Smith',
    creditScore: 695,
    verifiedIncome: 85000,
    employmentStatus: 'Marketing Manager',
    description: 'Good credit, consistent payment history',
  },
  {
    id: 'human-fair',
    name: 'Charlie Davis',
    creditScore: 620,
    verifiedIncome: 55000,
    employmentStatus: 'Freelance Designer',
    description: 'Fair credit, variable income',
  },
]

export const TEST_AGENT_PROFILES: AgentCreditProfile[] = [
  {
    id: 'agent-high-revenue',
    wallet: 'TRUTHs9agP5NUBa5cUoaS5J6dMSzPu7H2vL95x8WRDj',
    creditScore: 782,
    totalRevenue: 850000,
    successRate: 89,
    operationalDays: 365,
    framework: 'Custom',
    description: 'High-revenue trading agent with excellent track record',
  },
  {
    id: 'agent-ecosystem-leader',
    wallet: '8Wv1Dx3LHCemCX3eYdXMmKFyRNdBPt6QMQF2yWANqK9L',
    creditScore: 715,
    totalRevenue: 420000,
    successRate: 76,
    operationalDays: 240,
    framework: 'AI16Z',
    description: 'Ecosystem leader with strong community presence',
  },
  {
    id: 'agent-eliza',
    wallet: 'ELiZa1234567890abcdefghijklmnopqrstuvwxyz',
    creditScore: 680,
    totalRevenue: 125000,
    successRate: 71,
    operationalDays: 180,
    framework: 'ElizaOS',
    description: 'ElizaOS-based agent with moderate performance',
  },
]

export const MOCK_CREDIT_ANALYSES: Record<string, MockCreditAnalysis> = {
  excellent: {
    score: 782,
    summary: 'Excellent creditworthiness with minimal risk',
    strengths: ['Long credit history', 'No missed payments', 'Low credit utilization', 'Stable income'],
    risks: [],
    recommendation: 'Approve',
  },
  good: {
    score: 695,
    summary: 'Good credit profile with acceptable risk level',
    strengths: ['Consistent payment history', 'Moderate credit utilization', 'Steady employment'],
    risks: ['Recent credit inquiries'],
    recommendation: 'Approve',
  },
  fair: {
    score: 620,
    summary: 'Fair credit with some risk factors',
    strengths: ['Recent payment improvements', 'Active credit accounts'],
    risks: ['Variable income', 'High credit utilization', 'Limited credit history'],
    recommendation: 'Review',
  },
}

export function generateMockAgentMetrics(wallet?: string) {
  const profile = wallet
    ? TEST_AGENT_PROFILES.find((p) => p.wallet === wallet)
    : TEST_AGENT_PROFILES[Math.floor(Math.random() * TEST_AGENT_PROFILES.length)]

  return (
    profile || {
      creditScore: 550 + Math.floor(Math.random() * 250),
      totalRevenue: 50000 + Math.floor(Math.random() * 200000),
      successRate: 60 + Math.floor(Math.random() * 35),
      operationalDays: 30 + Math.floor(Math.random() * 300),
      framework: (['ElizaOS', 'AI16Z', 'Custom'] as const)[Math.floor(Math.random() * 3)],
    }
  )
}

export function getTestAttestationData() {
  return {
    id: new PublicKey('11111111111111111111111111111111'),
    owner: new PublicKey('11111111111111111111111111111111'),
    creditScore: 700,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    entityType: 'Human' as const,
  }
}

export function getTestLoanData() {
  return {
    id: new PublicKey('11111111111111111111111111111111'),
    borrower: new PublicKey('11111111111111111111111111111111'),
    amount: 10000,
    status: 'Active' as const,
    createdAt: Date.now(),
    dueDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
  }
}

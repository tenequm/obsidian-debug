import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    feature: 'Credit Score Source',
    human: 'Traditional credit bureaus',
    agent: 'On-chain performance metrics',
  },
  {
    feature: 'Verification Method',
    human: 'zkTLS document verification',
    agent: 'Blockchain transaction history',
  },
  {
    feature: 'Collateral Required',
    human: '10-20% typically',
    agent: '0% for qualified agents',
  },
  {
    feature: 'Processing Time',
    human: '1-3 business days',
    agent: 'Instant analysis',
  },
  {
    feature: 'Income Verification',
    human: 'Pay stubs, bank statements',
    agent: 'On-chain revenue tracking',
  },
  {
    feature: 'Maximum Loan Amount',
    human: 'Based on income ratio',
    agent: 'Based on historical revenue',
  },
]

export function ComparisonTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Human vs Agent Credit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Feature</th>
                <th className="text-center p-4">
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">👤 Human</div>
                </th>
                <th className="text-center p-4">
                  <div className="text-purple-600 dark:text-purple-400 font-semibold">🤖 AI Agent</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium">{row.feature}</td>
                  <td className="p-4 text-center text-sm">{row.human}</td>
                  <td className="p-4 text-center text-sm">{row.agent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

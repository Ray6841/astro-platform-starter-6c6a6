import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type DashboardData = { totalStockValue: number; lowStockCount: number; monthlyOrders: number; fulfillmentRate: number }

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setData(res.data))
  }, [])
  if (!data) return <div>Loading...</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card title="Total stock value" value={`$${data.totalStockValue.toFixed(2)}`} />
      <Card title="Low-stock items" value={data.lowStockCount} />
      <Card title="Monthly orders" value={data.monthlyOrders} />
      <Card title="Fulfillment rate" value={`${data.fulfillmentRate}%`} />
    </div>
  )
}

function Card({ title, value }: { title: string, value: any }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
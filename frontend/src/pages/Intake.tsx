import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Intake() {
  const [requests, setRequests] = useState<any[]>([])
  useEffect(() => {
    axios.get('/api/intake/requests', { headers: { 'X-Tenant-Id': 'tenant-demo' } }).then(r => setRequests(r.data))
  }, [])
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Request Intake</h2>
        <button className="bg-blue-600 text-white px-3 py-2 rounded">New Request</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded shadow">
            <div className="font-medium">{r.data?.description || 'Request'}</div>
            <div className="text-sm text-gray-500">Status: {r.status}</div>
            <div className="text-sm text-gray-500">Dept: {r.department || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
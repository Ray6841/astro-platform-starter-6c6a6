import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PickList(){
  const { id } = useParams()
  const [data, setData] = useState<any | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{ if(id) api.get(`/orders/${id}/picklist`).then(res=>setData(res.data)) },[id])
  if(!data) return <div>Loading...</div>
  const onPrint = () => { window.print() }
  const onPdf = () => {
    const doc = new jsPDF()
    doc.text(`Picklist - Order ${data.orderId}`, 14, 14)
    autoTable(doc, { head: [["Part Number","Description","Bin","Location","Qty","Barcode"]], body: data.items.map((it:any)=>[it.partNumber,it.description||'',it.binNumber||'',it.location||'',String(it.quantity),it.barcode]) })
    doc.save(`picklist_${data.orderId}.pdf`)
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={onPrint} className="px-3 py-2 bg-gray-200 rounded">Print</button>
        <button onClick={onPdf} className="px-3 py-2 bg-gray-200 rounded">Export PDF</button>
      </div>
      <div ref={ref} className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Order {data.orderId}</h3>
        <table className="min-w-full">
          <thead><tr>{['Part Number','Description','Bin','Location','Qty','Barcode'].map(h=> <th key={h} className="text-left px-4 py-2 text-sm text-gray-600">{h}</th>)}</tr></thead>
          <tbody>
            {data.items.map((it:any, idx:number)=> (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{it.partNumber}</td>
                <td className="px-4 py-2">{it.description}</td>
                <td className="px-4 py-2">{it.binNumber}</td>
                <td className="px-4 py-2">{it.location}</td>
                <td className="px-4 py-2">{it.quantity}</td>
                <td className="px-4 py-2">{it.barcode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
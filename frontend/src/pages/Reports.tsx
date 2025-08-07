import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Reports(){
  const [items, setItems] = useState<any[]>([])
  const load = () => api.get('/reports/reorder').then((res)=>setItems(res.data.items))
  useEffect(()=>{ load() },[])

  const exportPdf = () => {
    const doc = new jsPDF()
    doc.text('Reorder Suggestions', 14, 14)
    autoTable(doc, { head: [["Part","In Stock","Reorder Level","Suggested Qty","Lead Time (days)"]], body: items.map((i)=>[i.partNumber, String(i.quantityInStock), String(i.reorderLevel), String(i.suggestedOrderQty), String(i.leadTimeDays||0)]) })
    doc.save('reorder_suggestions.pdf')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reorder Suggestions</h2>
        <button onClick={exportPdf} className="bg-gray-200 px-3 py-2 rounded">Export PDF</button>
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead><tr>{['Part','In Stock','Reorder Level','Suggested Qty','Lead Time (days)'].map(h=> <th key={h} className="text-left px-4 py-2 text-sm text-gray-600">{h}</th>)}</tr></thead>
          <tbody>
            {items.map((i, idx)=> (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{i.partNumber}</td>
                <td className="px-4 py-2">{i.quantityInStock}</td>
                <td className="px-4 py-2">{i.reorderLevel}</td>
                <td className="px-4 py-2">{i.suggestedOrderQty}</td>
                <td className="px-4 py-2">{i.leadTimeDays||0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
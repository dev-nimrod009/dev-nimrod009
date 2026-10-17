import { useState } from 'react'

export default function PaymentModal({onClose}:{onClose:()=>void}){
  const [amount, setAmount] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h3 className="text-lg font-semibold mb-2">Record Payment</h3>
        <input className="w-full p-2 border rounded mb-3" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  )
}

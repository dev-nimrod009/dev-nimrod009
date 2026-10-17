import { useState } from "react";
import "./PaymentModal.scss";

export default function PaymentModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Record Payment</h3>
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save">Save</button>
        </div>
      </div>
    </div>
  );
}

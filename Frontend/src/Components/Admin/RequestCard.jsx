import { useState } from "react";
import "../../Styles/Admin/PendingRequest.css";

export default function MedicineCard({ data, onUpdate }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="pending-request-card">
        <span className="pending-status">{data.verification_status}</span>
        <h2 className="pending-medicine-name">{data.name}</h2>

        <div className="pending-card-meta">
          <div className="pending-meta-item"><label>Brand</label><span>{data.brand_name || "N/A"}</span></div>
          <div className="pending-meta-item"><label>Price</label><span>₹{data.mrp}</span></div>
        </div>

        <div className="pending-card-actions">
          <button className="pending-btn pending-approve-btn">Approve</button>
          <button className="pending-btn pending-reject-btn">Reject</button>
          <button className="pending-btn pending-details-btn" onClick={() => setOpen(true)}>Details</button>
        </div>
      </div>

      {open && (
        <div className="pending-modal-overlay" onClick={() => setOpen(false)}>
          <div className="pending-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pending-modal-header">
              <div>
                <small style={{ color: '#facc15' }}>RECORD ID: {data._id?.slice(-6)}</small>
                <h2 style={{ margin: 0 }}>{data.name}</h2>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✖</button>
            </div>

            <div className="pending-modal-body">
              <div className="pending-modal-section">
                <span className="pending-section-title">Administration</span>
                <Info label="Form" value={data.dosage_form} />
                <Info label="Strength" value={data.strength} />
                <Info label="Route" value={data.route_of_administration} />
              </div>

              <div className="pending-modal-section">
                <span className="pending-section-title">Compliance</span>
                <Info label="Drug Code" value={data.drug_code} />
                <Info label="Schedule" value={data.schedule} />
                <Info label="HSN" value={data.hsn_code} />
              </div>

              <div className="pending-modal-section">
                <span className="pending-section-title">Inventory</span>
                <Info label="MRP" value={`₹${data.mrp}`} />
                <Info label="Cost" value={`₹${data.cost_price}`} />
                <Info label="Verified" value={data.is_verified ? "Yes" : "No"} />
              </div>

              <div className="pending-modal-section pending-full-width">
                <span className="pending-section-title">Composition</span>
                {data.composition?.map((c, i) => <span key={i} className="pending-tag">{c}</span>)}
              </div>

              <div className="pending-modal-section pending-full-width">
                <span className="pending-section-title">Safety Information</span>
                <div style={{ display: 'flex', gap: '40px' }}>
                   <div><label style={{fontSize: '10px', color: '#94a3b8'}}>Warnings</label><div>{data.warnings?.join(", ") || "None"}</div></div>
                   <div><label style={{fontSize: '10px', color: '#94a3b8'}}>Side Effects</label><div>{data.side_effects?.join(", ") || "None"}</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="pending-data-row">
      <label>{label}</label>
      <span>{value || "N/A"}</span>
    </div>
  );
}
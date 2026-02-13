import { useState } from "react";
import "../Styles/Components/MedicalForm.css"

/**
 * ArrayInput Component
 * Defined outside to prevent re-mounting on every keystroke.
 */
const ArrayInput = ({ label, field, temp, setTemp, form, addItem, removeItem }) => (
  <div className="array-box">
    <label>{label}</label>
    <div className="array-row">
      <input
        value={temp[field]}
        onChange={(e) =>
          setTemp(prev => ({
            ...prev,
            [field]: e.target.value
          }))
        }
        placeholder={`Add ${label}`}
      />
      <button
        type="button"
        onClick={() => addItem(field)}
      > Add
      </button>
    </div>

    <div className="tags">
      {form[field].map((item, i) => (
        <span key={i} className="tag">
          {item}
          <button
            type="button"
            onClick={() => removeItem(field, i)}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  </div>
);

export default function MedicalForm() {
  const [form, setForm] = useState({
    name: "",
    brand_name: "",
    composition: [],
    category: [],
    warnings: [],
    side_effects: [],
    storage_conditions: [],
    dosage_form: "",
    strength: "",
    route_of_administration: "",
    drug_code: "",
    hsn_code: "",
    manufacturing_license: "",
    approval_number: "",
    mrp: "",
    cost_price: ""
  });

  const [temp, setTemp] = useState({
    composition: "",
    category: "",
    warnings: "",
    side_effects: "",
    storage_conditions: ""
  });

  const [documents, setDocuments] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFiles = (e) => {
    setDocuments([...e.target.files]);
  };

  const addItem = (field) => {
    const val = temp[field].trim();
    if (!val) return;
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], val]
    }));
    setTemp(prev => ({
      ...prev,
      [field]: ""
    }));
  };

  const removeItem = (field, index) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const openReview = () => {
    if (!form.name || form.composition.length === 0) {
      alert("Name and Composition are required");
      return;
    }
    setShowReview(true);
  };

  const closeReview = () => {
    setShowReview(false);
  };

  const finalSubmit = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          fd.append(k, JSON.stringify(v));
        } else {
          fd.append(k, v);
        }
      });
      documents.forEach(file => {
        fd.append("medicineDocuments", file);
      });

      await fetch("/addMeds", {
        method: "POST",
        body: fd,
        credentials: "include"
      });

      alert("Medicine submitted!");
      closeReview();
    } catch (err) {
      alert("Submission failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reusable prop object to clean up the JSX
  const arrayProps = { temp, setTemp, form, addItem, removeItem };

  return (
    <div className="medicine-page">
      <h1>Add New Medicine</h1>

      <div className="medicine-layout">
        <div className="medicine-form">
          <section>
            <h3>Basic Info</h3>
            <div className="form-grid">
              <div className="field">
                <label>Medicine Name *</label>
                <input
                  name="name"
                  value={form.name}
                  placeholder="Enter The Name"
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Brand Name</label>
                <input
                  name="brand_name"
                  value={form.brand_name}
                  placeholder="Brand Details"
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Drug Code *</label>
                <input
                  name="drug_code"
                  value={form.drug_code}
                  placeholder="Government Verified Drug Code"
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>HSN Code *</label>
                <input
                  name="hsn_code"
                  value={form.hsn_code}
                  placeholder="Government Verified HSN Code"
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section>
            <h3>Medical Details</h3>
            <div className="form-grid">
              <div className="field full-width">
                <ArrayInput
                  label="Composition *"
                  field="composition"
                  {...arrayProps}
                />
              </div>
              <div className="field">
                <label>Dosage Form</label>
                <input
                  name="dosage_form"
                  value={form.dosage_form}
                  onChange={handleChange}
                  placeholder="Daily / Weekly / Monthly"
                />
              </div>
              <div className="field">
                <label>Strength</label>
                <input
                  name="strength"
                  value={form.strength}
                  placeholder="Eg :- 500mg"
                  onChange={handleChange}
                />
              </div>
              <div className="field full-width">
                <label>Route of Administration</label>
                <input
                  name="route_of_administration"
                  value={form.route_of_administration}
                  placeholder="Country Approved"
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section>
            <h3>Additional Info</h3>
            <div className="form-grid">
              <div className="field full-width">
                <ArrayInput label="Category" field="category" {...arrayProps} />
              </div>
              <div className="field full-width">
                <ArrayInput label="Storage Conditions" field="storage_conditions" {...arrayProps} />
              </div>
              <div className="field full-width">
                <ArrayInput label="Warnings" field="warnings" {...arrayProps} />
              </div>
              <div className="field full-width">
                <ArrayInput label="Side Effects" field="side_effects" {...arrayProps} />
              </div>
            </div>
          </section>

          <section>
            <h3>Pricing</h3>
            <div className="form-grid">
              <div className="field">
                <label>MRP (₹)</label>
                <input type="number" name="mrp" value={form.mrp} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Cost Price (₹)</label>
                <input type="number" name="cost_price" value={form.cost_price} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section>
            <h3>Legal</h3>
            <div className="form-grid">
              <div className="field">
                <label>Manufacturing License</label>
                <input name="manufacturing_license" value={form.manufacturing_license} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Approval Number</label>
                <input name="approval_number" value={form.approval_number} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section>
            <h3>Documents</h3>
            <div className="field full-width">
              <label>Upload Files</label>
              <input type="file" multiple onChange={handleFiles} />
            </div>
          </section>

          <button className="review-btn" onClick={openReview}>
            Review Submission
          </button>
        </div>

        <div className="medicine-preview">
          <div className="preview-card">
            <h2>{form.name || "Medicine Name"}</h2>
            <p><b>Drug Code:</b> {form.drug_code || "-"}</p>
            <p><b>Composition:</b></p>
            {form.composition.map((c, i) => (
              <span key={i} className="preview-pill">{c}</span>
            ))}
            <p><b>MRP:</b> ₹{form.mrp || "-"}</p>
            <p><b>Status:</b> Pending Verification</p>
            <p><b>Documents:</b> {documents.length}</p>
          </div>
        </div>
      </div>
{showReview && (
  <div className="review-modal">
    <div className="modal">
      <div className="modal-header">
        <h2>Review Medicine Details</h2>
      </div>

      <div className="modal-body">
        <div className="review-grid">
          
          {/* Section 1: Basic & Pricing */}
          <div className="review-section">
            <h4>General & Pricing</h4>
            <div className="data-row"><span className="label">Name</span><span className="value">{form.name}</span></div>
            <div className="data-row"><span className="label">Brand</span><span className="value">{form.brand_name || "-"}</span></div>
            <div className="data-row"><span className="label">MRP</span><span className="value">₹{form.mrp}</span></div>
            <div className="data-row"><span className="label">Cost</span><span className="value">₹{form.cost_price}</span></div>
          </div>

          {/* Section 2: Medical Details */}
          <div className="review-section">
            <h4>Medical Info</h4>
            <div className="data-row"><span className="label">Dosage</span><span className="value">{form.dosage_form}</span></div>
            <div className="data-row"><span className="label">Strength</span><span className="value">{form.strength}</span></div>
            <div className="data-row">
              <span className="label">Composition</span>
              <div className="modal-pills">
                {form.composition.map((c, i) => <span key={i} className="modal-pill">{c}</span>)}
              </div>
            </div>
          </div>

          {/* Section 3: Codes & Legal */}
          <div className="review-section">
            <h4>Compliance</h4>
            <div className="data-row"><span className="label">Drug Code</span><span className="value">{form.drug_code}</span></div>
            <div className="data-row"><span className="label">HSN Code</span><span className="value">{form.hsn_code}</span></div>
            <div className="data-row"><span className="label">License</span><span className="value">{form.manufacturing_license || "-"}</span></div>
          </div>

          {/* Section 4: Files */}
          <div className="review-section">
                  <h4>Pre-Cautions</h4>
                     <div className="data-row">
              <span className="label">Warnings</span>
              <div className="modal-pills">
                {form.warnings.map((c, i) => <span key={i} className="modal-pill">{c}</span>)}
              </div>
                  </div>
                  
                   <div className="data-row">
              <span className="label">Side-Effects</span>
              <div className="modal-pills">
                {form.side_effects.map((c, i) => <span key={i} className="modal-pill">{c}</span>)}
              </div>
            </div>
            <div className="data-row"><span className="label">Documents</span><span className="value">{documents.length} Files</span></div>
          </div>

        </div>
      </div>

      <div className="modal-actions">
        <button className="cancel-btn" onClick={closeReview}>Go Back</button>
        <button className="confirm-btn" onClick={finalSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Confirm & Submit"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
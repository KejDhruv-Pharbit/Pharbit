import { useState } from "react";
import "../Styles/Components/MedicalForm.css"

export default function MedicalForm() {

  /* ================= STATE ================= */

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


  /* ================= HANDLERS ================= */

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


  /* ================= SUBMIT ================= */

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


      /* API CALL */
      // await fetch("/addMeds", {
      //   method: "POST",
      //   body: fd,
      //   credentials: "include"
      // });

      console.log("SUBMIT DATA:", form);

      alert("Medicine submitted!");

      closeReview();

    } catch (err) {
      alert("Submission failed" , err );

    } finally {
      setLoading(false);
    }
  };


  /* ================= COMPONENT ================= */

  const ArrayInput = ({ label, field }) => (

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
        >
          Add
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


  /* ================= UI ================= */

  return (
    <div className="medicine-page">


      <h1>Add New Medicine</h1>


      <div className="medicine-layout">


        {/* FORM */}
        <div className="medicine-form">


          {/* BASIC */}
          <section>

            <h3>Basic Info</h3>

            <input
              name="name"
              placeholder="Medicine Name *"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="brand_name"
              placeholder="Brand Name"
              value={form.brand_name}
              onChange={handleChange}
            />

            <input
              name="drug_code"
              placeholder="Drug Code"
              value={form.drug_code}
              onChange={handleChange}
            />

            <input
              name="hsn_code"
              placeholder="HSN Code"
              value={form.hsn_code}
              onChange={handleChange}
            />

          </section>


          {/* MEDICAL */}
          <section>

            <h3>Medical</h3>

            <ArrayInput
              label="Composition *"
              field="composition"
            />

            <input
              name="dosage_form"
              placeholder="Dosage Form"
              value={form.dosage_form}
              onChange={handleChange}
            />

            <input
              name="strength"
              placeholder="Strength"
              value={form.strength}
              onChange={handleChange}
            />

            <input
              name="route_of_administration"
              placeholder="Route"
              value={form.route_of_administration}
              onChange={handleChange}
            />

          </section>


          {/* META */}
          <section>

            <h3>Additional Info</h3>

            <ArrayInput
              label="Category"
              field="category"
            />

            <ArrayInput
              label="Storage Conditions"
              field="storage_conditions"
            />

            <ArrayInput
              label="Warnings"
              field="warnings"
            />

            <ArrayInput
              label="Side Effects"
              field="side_effects"
            />

          </section>


          {/* PRICING */}
          <section>

            <h3>Pricing</h3>

            <input
              type="number"
              name="mrp"
              placeholder="MRP"
              value={form.mrp}
              onChange={handleChange}
            />

            <input
              type="number"
              name="cost_price"
              placeholder="Cost Price"
              value={form.cost_price}
              onChange={handleChange}
            />

          </section>


          {/* LEGAL */}
          <section>

            <h3>Legal</h3>

            <input
              name="manufacturing_license"
              placeholder="License No"
              value={form.manufacturing_license}
              onChange={handleChange}
            />

            <input
              name="approval_number"
              placeholder="Approval No"
              value={form.approval_number}
              onChange={handleChange}
            />

          </section>


          {/* DOCS */}
          <section>

            <h3>Documents</h3>

            <input
              type="file"
              multiple
              onChange={handleFiles}
            />

          </section>


          <button
            className="review-btn"
            onClick={openReview}
          >
            Review Submission
          </button>


        </div>


        {/* PREVIEW */}
        <div className="medicine-preview">

          <div className="preview-card">

            <h2>{form.name || "Medicine Name"}</h2>

            <p><b>Drug Code:</b> {form.drug_code || "-"}</p>

            <p><b>Composition:</b></p>

            {form.composition.map((c, i) => (
              <span key={i} className="preview-pill">{c}</span>
            ))}

            <p><b>MRP:</b> ₹{form.mrp || "-"}</p>

            <p><b>Status:</b> Pending</p>

            <p><b>Docs:</b> {documents.length}</p>

          </div>

        </div>

      </div>


      {/* MODAL */}
      {showReview && (

        <div className="review-modal">

          <div className="modal">

            <h2>Confirm Submission</h2>


            <div className="modal-body">

              {Object.entries(form).map(([k, v]) => (

                <p key={k}>
                  <b>{k}:</b>{" "}
                  {Array.isArray(v)
                    ? v.join(", ")
                    : v || "-"}
                </p>

              ))}

              <p><b>Documents:</b> {documents.length}</p>

            </div>


            <div className="modal-actions">

              <button onClick={closeReview}>
                Cancel
              </button>

              <button
                onClick={finalSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Final Submit"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
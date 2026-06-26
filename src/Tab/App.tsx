import { useState } from "react";
import "./App.css";

export default function App() {
  const [vendor, setVendor] = useState("");
  const [budget, setBudget] = useState("");
  const [department, setDepartment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!vendor || !budget || !department) {
      alert("Please fill all fields!");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>✅ PR Submitted!</h2>
        <p>Vendor: {vendor}</p>
        <p>Budget: ₹{budget}</p>
        <p>Department: {department}</p>
        <button onClick={() => setSubmitted(false)}>
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      <h2>📋 PR Assistant</h2>

      <div style={{ marginBottom: 16 }}>
        <label>Vendor Name</label>
        <input
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          placeholder="e.g. ABC Suppliers"
          value={vendor}
          onChange={e => setVendor(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Budget (₹)</label>
        <input
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          placeholder="e.g. 50000"
          value={budget}
          onChange={e => setBudget(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Department</label>
        <select
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          value={department}
          onChange={e => setDepartment(e.target.value)}
        >
          <option value="">Select Department</option>
          <option value="IT">IT Equipment</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Ops">Operations</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: 10,
          background: "#6264a7",
          color: "white",
          border: "none",
          borderRadius: 6,
          fontSize: 14,
          cursor: "pointer"
        }}
      >
        ✅ Submit PR
      </button>
    </div>
  );
}
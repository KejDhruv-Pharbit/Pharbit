import React, { useState } from 'react';
import "../../Styles/Pages/InviteEmployee.css"

const InviteEmployee = () => {
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Employee'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:6090/org/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // As requested
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Success! Employee has been invited.');
        setData({ firstName: '', lastName: '', email: '', role: 'Employee' });
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'Failed to send invite'}`);
      }
    } catch (error) {
      alert('Network error. Is the server running at port 6090?' , error );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-employee-wrapper">
      <div className="invite-employee-card">
        <header className="invite-employee-header">
          <h1 className="invite-employee-title">Invite Team Member</h1>
          <p className="invite-employee-subtitle">
            Enter the details below to grant organization access.
          </p>
        </header>

        <form className="invite-employee-form" onSubmit={handleSubmit}>
          <div className="invite-employee-row">
            <div className="invite-employee-group">
              <label className="invite-employee-label">First Name</label>
              <input
                className="invite-employee-input"
                name="firstName"
                placeholder="e.g. John"
                value={data.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="invite-employee-group">
              <label className="invite-employee-label">Last Name</label>
              <input
                className="invite-employee-input"
                name="lastName"
                placeholder="e.g. Doe"
                value={data.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="invite-employee-group">
            <label className="invite-employee-label">Work Email</label>
            <input
              className="invite-employee-input"
              type="email"
              name="email"
              placeholder="name@company.com"
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="invite-employee-group">
            <label className="invite-employee-label">Assigned Role</label>
            <select
              className="invite-employee-select"
              name="role"
              value={data.role}
              onChange={handleChange}
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button 
            className="invite-employee-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Sending Invite...' : 'Send Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteEmployee;
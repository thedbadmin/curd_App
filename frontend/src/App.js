import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    city: '',
    department: '',
    salary: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showMessage('Failed to fetch employees. Please try again.', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        showMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`, 'error');
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showMessage('Please enter a valid email address', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary) || 0
      };

      if (editMode) {
        response = await axios.put(`${API_URL}/employees/${editId}`, payload);
        showMessage('Employee updated successfully!', 'success');
      } else {
        response = await axios.post(`${API_URL}/employees`, payload);
        showMessage('Employee added successfully!', 'success');
      }

      // Update the employees list with the new/updated employee
      if (editMode) {
        setEmployees(prev => prev.map(emp => emp.id === editId ? response.data : emp));
      } else {
        setEmployees(prev => [...prev, response.data]);
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        city: '',
        department: '',
        salary: ''
      });
      setEditMode(false);
      setEditId(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save record. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber || '',
      city: employee.city || '',
      department: employee.department || '',
      salary: employee.salary || ''
    });
    setEditMode(true);
    setEditId(employee.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await axios.delete(`${API_URL}/employees/${id}`);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      showMessage('Employee deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting employee:', error);
      showMessage('Failed to delete employee. Please try again.', 'error');
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Employee Management Software</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First Name"
            required
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last Name"
            required
          />
        </div>
        <div className="form-row">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Phone Number"
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="City"
          />
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            placeholder="Department"
          />
        </div>
        <div className="form-row">
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            placeholder="Salary"
            step="0.01"
          />
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? 'Processing...' : (editMode ? 'Update Record' : 'Save Record')}
          </button>
        </div>
      </form>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.id}>
                <td>{index + 1}</td>
                <td>{employee.firstName}</td>
                <td>{employee.lastName}</td>
                <td>{employee.email}</td>
                <td>{employee.phoneNumber}</td>
                <td>{employee.city}</td>
                <td>{employee.department}</td>
                <td>{employee.salary}</td>
                <td>{new Date(employee.date).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(employee)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(employee.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/admin_records`);
      setAdmins(response.data.Result);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const handleAddAdmin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Email and password cannot be empty");
      return;
    }

    const emailExists = admins.some((admin) => admin.email === email);
    if (emailExists) {
      alert("An admin with this email already exists");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/auth/add_admin`, {
        email,
        password,
      });
      console.log(response.data);
      fetchAdmins();
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };


  const handleDeleteAdmin = async (id) => {
    try {
      const response = await axios.delete(`${apiUrl}/auth/delete_admin/${id}`);
      console.log(response.data);
      fetchAdmins(); // Refresh the admin list after deletion
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  return (
    <div className="container mt-2 p-5">
      <h2>Add Admin</h2>
      <div className="row">
        <div className="col-md-4 mb-3">
          <input
            type="email"
            className="form-control"
            autoComplete="off"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            key="emailInput"
          />
        </div>
        <div className="col-md-4 mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            key="passwordInput"
          />
        </div>
        <div className="col-md-4">
          <button className="btn btn-primary" onClick={handleAddAdmin}>Add Admin</button>
        </div>
      </div>

      <h2 className="mt-5">Admins List</h2>
      <ul className="list-group">
        {admins.map((admin) => (
          <li key={admin.id} className="list-group-item d-flex justify-content-between align-items-center">
            {admin.email}{" "}
            <button className="btn btn-danger" onClick={() => handleDeleteAdmin(admin.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageAdmin;

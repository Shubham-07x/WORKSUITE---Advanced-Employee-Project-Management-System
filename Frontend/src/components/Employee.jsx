import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/auth/employee`)
      .then((response) => {
        if (response.data.success) {
          setEmployees(response.data.Result);
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => console.log(error));
  }, []);

  const handleDelete = (id) => {
    axios
      .delete(`${apiUrl}/auth/delete_employee/${id}`)
      .then((response) => {
        if (response.data.success) {
          // Refresh the employee list
          axios
            .get(`${apiUrl}/auth/employee`)
            .then((response) => {
              if (response.data.success) {
                setEmployees(response.data.Result); 
              } else {
                alert(response.data.message);
              }
            })
            .catch((error) => console.log(error));
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>Employee List</h3>
      </div>
      <Link to="/dashboard/add_employee" className="btn btn-success">
        Add Employee
      </Link>
      <div className="mt-3">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Image</th>
              <th>Email</th>
              <th>Address</th>
              <th>Salary</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>
                  <div style={{ width: "100px", height: "100px" }}>
                    {employee.image ? (
                      <img
                        src={`http://localhost:3000/Images/${employee.image}`}
                        alt={employee.name}
                        className="employee-image"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="bg-secondary text-center"
                        style={{ width: "100%", height: "100%", lineHeight: "100px" }}
                      >
                        Placeholder
                      </div>
                    )}
                  </div>
                </td>
                <td>{employee.email}</td>
                <td>{employee.address}</td>
                <td>{employee.salary}</td>
                <td>
                  <Link
                    to={`/dashboard/edit_employee/${employee.id}`}
                    className="btn btn-info btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleDelete(employee.id)}
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
};

export default Employee;

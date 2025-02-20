import { useState, useEffect } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function AddEmployee() {
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
    address: "",
    category_id: "",
    image: null,
  });
  

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formKey, setFormKey] = useState(Date.now());
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${apiUrl}/auth/category`)
      .then(response => {
        setCategories(response.data.categories);
      })
      .catch(err => console.log(err));
  }, []);

  const handleNavigateBack = () => {
    navigate('/dashboard/employee');
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', employee.name);
    formData.append('email', employee.email.toLowerCase());
    formData.append('password', employee.password);
    formData.append('address', employee.address);
    formData.append('salary', employee.salary);
    formData.append('image', employee.image);
    formData.append('category_id', employee.category_id);

    axios.post('http://localhost:3000/auth/add_employee', formData)
      .then(result => {
        console.log(result.data);
        if (result.data.success) {
          setSuccessMessage(result.data.message);
          setError("");
          setEmployee({
            name: "",
            email: "",
            password: "",
            salary: "",
            address: "",
            category_id: "",
            image: "",
          });
          setFormKey(Date.now());
        } else {
          setError(result.data.message);
          setSuccessMessage("");
        }
      })
      .catch(err => {
        console.log(err);
        setError("An error occurred while adding the Employee.");
        setSuccessMessage("");
      });
  };
  return (
    <div className='d-flex justify-content-center align-items-center mt-3 loginPage'>
      <div className="p-1 rounded loginForm">
        <div className="" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px' }}>
          <div className="mb-3">
            <button onClick={handleNavigateBack} className=" btn btn-link back-button ">&#8592; Back to Dashboard</button>
          </div>
          <div className="d-flex justify-content-between">
            <h2>Add Employee</h2>
          </div>
          <div className="form-container">
            <form key={formKey} className="row g-1" onSubmit={handleSubmit}>
              <div className="col-12">
                <label htmlFor="inputName" className="form-label">
                  <span className='bold-form-label'>Name:</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputName"
                  placeholder="Enter Name"
                  onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inputEmail4" className="form-label">
                  <span className='bold-form-label'>Email:</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="inputEmail4"
                  placeholder="Enter Email"
                  autoComplete="off"
                  onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inputPassword4" className="form-label">
                  <span className='bold-form-label'>Password:</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="inputPassword4"
                  placeholder="Enter Password"
                  onChange={(e) => setEmployee({ ...employee, password: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inputSalary" className="form-label">
                  <span className='bold-form-label'>Salary:</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputSalary"
                  placeholder="Enter Salary"
                  autoComplete="off"
                  onChange={(e) => setEmployee({ ...employee, salary: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inputAddress" className="form-label">
                  <span className='bold-form-label'>Address:</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputAddress"
                  placeholder="H.No. 24,Streat"
                  autoComplete="off"
                  onChange={(e) => setEmployee({ ...employee, address: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="category" className="form-label">
                  <span className='bold-form-label'>Category:</span>
                </label>
                <select
                  name="category"
                  id="category"
                  className="form-select"
                  onChange={(e) => setEmployee({ ...employee, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label" htmlFor="inputGroupFile01">
                  <span className='bold-form-label'>Select Image:</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="inputGroupFile01"
                  name="image"
                  onChange={(e) => setEmployee({ ...employee, image: e.target.files[0] })}
                />
              </div>
              <div className="col-12">
                <button type="submit" className=" w-100 button-74">Add Employee</button>
              </div>
              {error && <div className="text-danger mt-3">{error}</div>}
              {successMessage && <div className="text-success mt-3">{successMessage}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


export default AddEmployee

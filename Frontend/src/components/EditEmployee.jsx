import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';

const EditEmployee = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState({
        name: "",
        email: "",
        salary: "",
        address: "",
        category_id: "",
    });
    const [category, setCategory] = useState([]);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Fetch categories
        axios.get(`${apiUrl}/auth/category`)
            .then(result => {
                if (result.data.success) {
                    setCategory(result.data.categories);
                } else {
                    alert(result.data.message);
                }
            })
            .catch(err => console.log(err));

        // Fetch employee details
        axios.get(`${apiUrl}/auth/employee/${id}`)
            .then(result => {
                const employeeData = result.data.Result[0];
                setEmployee({
                    name: employeeData.name,
                    email: employeeData.email,
                    address: employeeData.address,
                    salary: employeeData.salary,
                    category_id: employeeData.category_id,
                });
            })
            .catch(err => console.log(err));
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`${apiUrl}/auth/edit_employee/${id}`, employee)
            .then(result => {
                if (result.data.success) {
                    navigate('/dashboard/employee');
                } else {
                    alert(result.data.message);
                }
            })
            .catch(err => console.log(err));
    };
    const handleNavigateBack = () => {
        navigate('/dashboard/employee');
    };

    return (
        <div className="d-flex justify-content-center align-items-center my-3">
            <div className="p-1 rounded loginForm">
                <div className="" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px' }}>
                    <div className="mb-3">
                        <button onClick={handleNavigateBack} className=" btn btn-link back-button ">&#8592; Back to Dashboard</button>
                    </div>
                    <h3 className="text-left">Edit Employee</h3>
                    <form className="row g-1 mt-2" onSubmit={handleSubmit}>
                        <div className="col-12">
                            <label htmlFor="inputName" className="form-label"><span className='bold-form-label '>Name </span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="inputName"
                                placeholder="Enter Name"
                                value={employee.name}
                                onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="inputEmail" className="form-label"><span className='bold-form-label '>Email </span></label>
                            <input
                                type="email"
                                className="form-control"
                                id="inputEmail"
                                placeholder="Enter Email"
                                value={employee.email}
                                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="inputSalary" className="form-label"><span className='bold-form-label '>Salary </span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="inputSalary"
                                placeholder="Enter Salary"
                                value={employee.salary}
                                onChange={(e) => setEmployee({ ...employee, salary: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="inputAddress" className="form-label"><span className='bold-form-label '>Address </span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="inputAddress"
                                placeholder="Enter Address"
                                value={employee.address}
                                onChange={(e) => setEmployee({ ...employee, address: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="inputCategory" className="form-label"><span className='bold-form-label '>Category </span></label>
                            <select
                                id="inputCategory"
                                className="form-select"
                                value={employee.category_id}
                                onChange={(e) => setEmployee({ ...employee, category_id: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {category.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary w-100 button-74">Update Employee</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditEmployee;

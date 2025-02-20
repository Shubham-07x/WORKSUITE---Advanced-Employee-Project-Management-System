import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddCategory() {
    const [category, setCategory] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleInputChange = (e) => {
        setCategory(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${apiUrl}/auth/add_category`, { name: category })
            .then(result => {
                console.log(result.data);
                if (result.data.success) { 
                    setSuccessMessage(result.data.message);
                    setError(""); 
                    setCategory("");
                } else {
                    setError(result.data.message);
                    setSuccessMessage(""); 
                }
            })
            .catch(err => {
                console.log(err);
                setError("An error occurred while adding the category.");
                setSuccessMessage(""); 
            })
    };
    
    const handleNavigateBack = () => {
        navigate('/dashboard/category');
    };

    return (
        <div className='d-flex justify-content-center align-items-center h-75 loginPage'>
            <div className="p-1 rounded loginForm">
                    <div className="" style={{backgroundColor:'white', padding:'30px', borderRadius:'12px'}}>
                <div className="mb-3">
                <button onClick={handleNavigateBack} className=" btn btn-link back-button ">&#8592; Back to Dashboard</button>
                </div>
                <div className="d-flex justify-content-between">
                    <h2>Add Category</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor='category' className="form-label"><span className='bold-form-label'>Category:</span></label>
                        <input
                            type="text"
                            name='category'
                            autoComplete='off'
                            placeholder='Enter Categories'
                            value={category}
                            onChange={handleInputChange}
                            className='form-control'
                        />
                    </div>
                    <button type="submit" className='button-74'>Add Category</button>
                    {error && <div className="text-danger mt-3">{error}</div>}
                    {successMessage && <div className="text-success mt-3">{successMessage}</div>}
                </form>
                </div>
            </div>
        </div>
    );
}

export default AddCategory;

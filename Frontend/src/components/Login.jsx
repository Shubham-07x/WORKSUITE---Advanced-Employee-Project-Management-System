import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if email or password is empty
        if (!values.email || !values.password) {
            toast.error("Email and password are required.");
            return;
        }
    
        try {
            const result = await axios.post(`${apiUrl}/auth/adminlogin`, values);
            if (result.data.loginStatus) {
                localStorage.setItem('valid', true);
                toast.success("Login successful!");
                navigate('/dashboard');
            } else {
                const errorMessage = result.data.error || "Invalid email or password.";
                toast.error(errorMessage);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                toast.error("Invalid email or password.");
            } else {
                console.error(error);
                toast.error("An error occurred.");
            }
        }
    };
    
    return (
        <div  id='form-body'>
        <div className='d-flex justify-content-center align-items-center vh-100 loginPage2'>
            <ToastContainer position="bottom-right" />
            <div className="p-1 rounded loginForm">
                    <div className="" style={{backgroundColor:'white', padding:'30px', borderRadius:'12px'}}>
                <h2>Login Page</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor='email' className="form-label"><span className='bold-form-label '>Email:</span></label>
                        <input
                            type="email"
                            id="emailInput"
                            name='email'
                            autoComplete='off'
                            placeholder='example@gmail.com'
                            value={values.email}
                            onChange={handleInputChange}
                            className='form-control'
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor='password' className="form-label"><span className='bold-form-label'>Password:</span></label>
                        <input
                            type="password"
                            name='password'
                            placeholder='Your password'
                            value={values.password}
                            onChange={handleInputChange}
                            className='form-control'
                        />
                    </div>
                    <button type="submit" className='button-74'>Log in</button>
                </form>
            </div>
            </div>
        </div>
        </div>
    );
}

export default Login;

import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Start = () => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios.get(`${apiUrl}/verify`, { withCredentials: true })
            .then(result => {
                if (result.data.Status) {
                    if (result.data.role === "admin") {
                        navigate('/dashboard');
                    } else {
                        navigate('/employeedetail/' + result.data.id);
                    }
                }
            })
            .catch(err => console.log(err));
    }, [navigate]);

    const handleEmployeeLogin = () => {
        navigate('/employeelogin');
    };

    const handleAdminLogin = () => {
        navigate('/adminlogin');
    };

    return (
        <div id='form-body'>
            <div className="d-flex justify-content-center align-items-center vh-100 loginPage2" >
                <div className="p-1 rounded loginForm">
                    <div className="" style={{backgroundColor:'white', padding:'30px', borderRadius:'12px'}}>
                        <h2 className="text-center">Login As</h2>
                        <div className="d-flex justify-content-between mt-5 mb-2">
                            <button type="button" className="btn btn-primary button-74 mx-2" onClick={handleEmployeeLogin}>
                                Employee
                            </button>
                            <button type="button" className="btn btn-success button-74 mx-2" onClick={handleAdminLogin}>
                                Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Start;

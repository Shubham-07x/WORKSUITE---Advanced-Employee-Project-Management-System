import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./EmployeeDetails.css";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import ClockIn from "./ClockIn";
import EmployeeCalendar from "./EmployeeCalendar";
import EmployeeTasks from "./PMT/EmployeeTasks";

function EmployeeDetail() {
  const [employee, setEmployee] = useState(null);
  const [category, setCategory] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/employee/detail/${id}`)
      .then((result) => {
        if (result.data.success && Array.isArray(result.data.Result)) {
          setEmployee(result.data.Result[0]);
        } else {
          console.error("Invalid response format:", result.data);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    if (employee) {
      axios
        .get(`${apiUrl}/employee/category/${employee.category_id}`)
        .then((result) => {
          if (result.data.success && result.data.category) {
            setCategory(result.data.category);
          } else {
            console.error("Invalid response format:", result.data);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [employee]);

  const handleLogout = () => {
    axios.defaults.withCredentials = true;
    axios
      .get(`${apiUrl}/employee/logout`)
      .then((result) => {
        if (result.data.Status) {
          localStorage.removeItem("valid");
          navigate("/");
        }
      })
      .catch((err) => console.error(err));
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  return (
    <div className="empPageColor">
      <header
        className="header-employee py-3"
        style={{ backgroundColor: "#fff" }}
      >
        <div className="container-fluid ">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="welcome">Welcome {employee.name}</h5>
            </div>
            <div className="col-md-6 text-end d-flex justify-content-end">
              <div className="time-day mx-2">
                <span>
                  <b>{currentTime}</b>
                </span>
                <br />
                <span style={{ fontSize: "13px" }}>{currentDay}</span>
              </div>
              <div className="mx-1">
                <Link
                  to="/"
                  onClick={handleLogout}
                  className="logout-btn btn btn-outline-danger logoutbtn py-2 mt-1"
                >
                  <i className="bi bi-box-arrow-right"></i> Logout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-12">
            <div className="card shadow EmployeeCard mx-auto">
              <div className="card-body">
                <div className="row align-items-center empCard">
                  <div className="col-md-5">
                    <div className="d-flex justify-content-center">
                      <img
                        src={`http://localhost:3000/Images/${employee.image}`}
                        className="card-img"
                        alt="Employee"
                      />
                    </div>
                  </div>
                  <div className="col-md-7 ml-2">
                    <h3 className="card-title">{employee.name}</h3>
                    <div className="details">
                      <p>
                        <span className="detailsTitle">Employee ID:</span>{" "}
                        {employee.id}
                      </p>
                      <p>
                        <span className="detailsTitle">Email:</span>{" "}
                        {employee.email}
                      </p>
                      {category && (
                        <p>
                          <span className="detailsTitle">Category:</span>{" "}
                          {category.name}
                        </p>
                      )}
                    </div>
                    <div className="buttons">
                      <ClockIn />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mt-5">
        <EmployeeTasks employeeId={id} />
      </div>
      <div className="container mt-5">
        <EmployeeCalendar employeeId={id} />
      </div>
    </div>
  );
}

export default EmployeeDetail;

import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSpring, animated } from "react-spring";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const apiUrl = import.meta.env.VITE_API_URL;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    axios.get(`${apiUrl}/auth/logout`).then((result) => {
      if (result.data.Status) {
        localStorage.removeItem("valid");
        navigate("/");
      }
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const AnimatedComponent = () => {
    const props = useSpring({
      from: { opacity: 0 },
      to: { opacity: 1 },
      config: { duration: 600 },
    });

    return (
      <animated.div style={props}>
        <Outlet />
      </animated.div>
    );
  };

  return (
    <div className="container-fluid" style={{ overflow: "hidden" }}>
      <div
        className={`row flex-nowrap ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
        <div className="col p-0 rounded-lg bg-white">
          <div className="p-3 d-flex justify-content-center top--title">
            <h4 className="m-0">
              <span
                style={{ fontWeight: "bold" }}
                className={`animate-charcter ${!sidebarOpen ? "hidden" : ""}`}
              >
                WORKSUITE
              </span>{" "}
              -
              <span
                style={{
                  color: "#b2b2b2",
                  fontSize: "1.2rem",
                  fontWeight: "500",
                }}
                className={`${!sidebarOpen ? "hidden" : ""}`}
              >
                {" "}
                Project Management System
              </span>
            </h4>
          </div>
          <div
            className="mt-2"
            style={{ maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}
          >
            <AnimatedComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

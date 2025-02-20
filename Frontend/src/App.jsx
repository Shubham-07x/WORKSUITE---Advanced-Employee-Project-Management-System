import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Employee from "./components/Employee";
import Category from "./components/Category";
import ManageAdmin from "./components/ManageAdmin";
import AddCategory from "./components/AddCategory";
import AddEmployee from "./components/AddEmployee";
import EditEmployee from "./components/EditEmployee";
import Start from "./components/Start";
import EmployeeLogin from "./components/EmployeeLogin";
import EmployeeDetail from "./components/EmployeeDetail";
import PrivateRoute from "./components/PrivateRoute";
import Office from "./components/Office";
import AdminProjects from "./components/PMT/AdminProjects";
import AdminTasks from "./components/PMT/AdminTasks";
import Clients from "./components/PMT/Clients";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />}></Route>
        <Route path="/adminlogin" element={<Login />}></Route>
        <Route path="/employeelogin" element={<EmployeeLogin />}></Route>
        <Route
          path="/employeedetail/:id"
          element={
            <PrivateRoute>
              <EmployeeDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="" element={<Home />}></Route>{" "}
          <Route path="employee" element={<Employee />}></Route>{" "}
          <Route path="category" element={<Category />}></Route>{" "}
          <Route path="manageadmin" element={<ManageAdmin />}></Route>{" "}
          <Route path="add_category" element={<AddCategory />}></Route>{" "}
          <Route path="add_employee" element={<AddEmployee />}></Route>{" "}
          <Route path="edit_employee/:id" element={<EditEmployee />}></Route>{" "}
          <Route path="projects" element={<AdminProjects />}></Route>{" "}
          <Route path="clients" element={<Clients />}></Route>{" "}
          <Route path="tasks" element={<AdminTasks />}></Route>{" "}
          <Route path="officeaddress" element={<Office />}></Route>{" "}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

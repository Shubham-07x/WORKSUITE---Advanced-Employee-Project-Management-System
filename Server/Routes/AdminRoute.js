import express from "express";
import db from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";


dotenv.config();

const router = express.Router();

//Router for Login Form
router.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM admin WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;

      const passwordsMatch = await bcrypt.compare(
        password,
        storedHashedPassword
      );
      if (passwordsMatch) {
        const token = jwt.sign(
          { role: "admin", email: user.email, id: user.id },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 3600000,
          secure: true,
        });

        return res
          .status(200)
          .json({ loginStatus: true, message: "You are logged in" });
      } else {
        return res
          .status(401)
          .json({ loginStatus: false, error: "Incorrect Email or Password" });
      }
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/category", async (req, res) => {
  try {
    const showCategory = await db.query("SELECT * FROM category");
    res.json({ success: true, categories: showCategory.rows });
  } catch (error) {
    console.error("Error displaying category:", error);
    res.json({ success: false, message: "Failed to load category" });
  }
});

router.post("/add_category", async (req, res) => {
  const { name } = req.body;

  try {
    const addCategory = await db.query(
      "INSERT INTO category (name) VALUES ($1)",
      [name]
    );
    res
      .status(200)
      .json({ success: true, message: "Category added successfully" });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: "Failed to add category" });
  }
});


// AddEmployee
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Route to add employee
router.post("/add_employee", upload.single("image"), async (req, res) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Insert employee into database
    const addEmployee = await db.query(
      "INSERT INTO employee (name, email, password, address, salary, image, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        req.body.name,
        req.body.email,
        hashedPassword,
        req.body.address,
        req.body.salary,
        req.file.filename,
        req.body.category_id,
      ]
    );

    // Send success response
    res
      .status(200)
      .json({ success: true, message: "Employee added successfully" });
  } catch (error) {
    // Log error and send error response
    console.error("Error adding employee:", error);
    res.status(500).json({ success: false, message: "Failed to add employee" });
  }
});


router.get("/employee", async (req, res) => {
  try {
    const getEmployees = await db.query("SELECT * FROM employee");
    res.json({ success: true, Result: getEmployees.rows });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.json({ success: false, message: "Failed to fetch employees" });
  }
});

// Router to delete an employee
router.delete("/delete_employee/:id", async (req, res) => {
  const { id } = req.params; 

  try {
    // Get the image filename of the employee to be deleted
    const getImageFilenameQuery = await db.query("SELECT image FROM employee WHERE id = $1", [
      id,
    ]);
    const imageFilename = getImageFilenameQuery.rows[0].image;

    // Delete the employee record from the database
    const deleteEmployee = await db.query("DELETE FROM employee WHERE id = $1", [
      id,
    ]);

    // Delete the image file from the server's file system
    if (imageFilename) {
      fs.unlinkSync(`public/images/${imageFilename}`);
    }

    res.status(200).json({ success: true, message: "Employee deleted" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ success: false, message: "Failed to delete employee" });
  }
});



// get category
router.get("/category", async (req, res) => {
  try {
      const showCategory = await db.query("SELECT * FROM category");
      res.json({ success: true, categories: showCategory.rows });
  } catch (error) {
      console.error("Error displaying category:", error);
      res.json({ success: false, message: "Failed to load category" });
  }
});


// Edit Employee
router.get("/employee/:id", async (req, res) => {
  const id = req.params.id;
  try {
      const getEmployee = await db.query("SELECT * FROM employee WHERE id = $1", [id]);
      res.json({ success: true, Result: getEmployee.rows });
  } catch (error) {
      console.error("Error fetching employee:", error);
      res.json({ success: false, message: "Failed to fetch employee" });
  }
});

router.put("/edit_employee/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, salary, address, category_id } = req.body;
  try {
      const updateEmployee = await db.query(
          "UPDATE employee SET name = $1, email = $2, salary = $3, address = $4, category_id = $5 WHERE id = $6",
          [name, email, salary, address, category_id, id]
      );
      res.json({ success: true, message: "Employee updated successfully" });
  } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ success: false, message: "Failed to update employee" });
  }
});

//Home

router.get('/admin_count', async (req, res) => {
  try {
    const adminCountQuery = await db.query("SELECT COUNT(id) AS admin FROM admin");
    res.json({ Status: true, Result: adminCountQuery.rows });
  } catch (error) {
    console.error("Error fetching admin count:", error);
    res.json({ Status: false, Error: "Failed to fetch admin count" });
  }
});

router.get('/employee_count', async (req, res) => {
  try {
    const employeeCountQuery = await db.query("SELECT COUNT(id) AS employee FROM employee");
    res.json({ Status: true, Result: employeeCountQuery.rows });
  } catch (error) {
    console.error("Error fetching employee count:", error);
    res.json({ Status: false, Error: "Failed to fetch employee count" });
  }
});

router.get('/salary_count', async (req, res) => {
  try {
    const salaryCountQuery = await db.query("SELECT SUM(salary) AS salaryOFEmp FROM employee");
    res.json({ Status: true, Result: salaryCountQuery.rows });
  } catch (error) {
    console.error("Error fetching salary count:", error);
    res.json({ Status: false, Error: "Failed to fetch salary count" });
  }
});

router.get('/admin_records', async (req, res) => {
  try {
    const adminRecordsQuery = await db.query("SELECT * FROM admin");
    res.json({ Status: true, Result: adminRecordsQuery.rows });
  } catch (error) {
    console.error("Error fetching admin records:", error);
    res.json({ Status: false, Error: "Failed to fetch admin records" });
  }
});



//logOut
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  return res.json({ Status: true });
});

//Edit employee
router.put("/edit_admin/:id", async (req, res) => {
  const id = req.params.id;
  const { email } = req.body;
  try {
    const updateAdmin = await db.query(
      "UPDATE admin SET email = $1 WHERE id = $2",
      [email, id]
    );
    res.json({ success: true, message: "Admin updated successfully" });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ success: false, message: "Failed to update admin" });
  }
});

// Delete Admin
router.delete("/delete_admin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteAdmin = await db.query("DELETE FROM admin WHERE id = $1", [id]);
    res.status(200).json({ success: true, message: "Admin deleted" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ success: false, message: "Failed to delete admin" });
  }
});

router.post("/add_admin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin into database
    const addAdmin = await db.query(
      "INSERT INTO admin (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    res.status(200).json({ success: true, message: "Admin added successfully" });
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).json({ success: false, message: "Failed to add admin" });
  }
});


export { router as adminRouter };

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import {
  Table,
  Button,
  Container,
  Form,
  Modal,
  Row,
  Col,
} from "react-bootstrap";

const socket = io("http://localhost:3000");

const AdminTasks = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newTask, setNewTask] = useState({
    description: "",
    employee_ids: [],
    deadline: "",
    project_id: projectId || "",
    status: "pending", // default status
  });
  const [editTask, setEditTask] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState({ project: "", employee: "" });
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTasks();
    fetchProjects();

    // Listen for real-time updates
    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.task_id === updatedTask.task_id ? updatedTask : task
        )
      );
    });

    return () => {
      socket.off("taskUpdated");
    };
  }, [projectId]);

  // Fetch tasks under this project
  const fetchTasks = () => {
    axios
      .get(`${apiUrl}/tasks?project_id=${projectId}`)
      .then((res) => {
        if (res.data.success) {
          setTasks(res.data.tasks);
        }
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  };

  // Fetch available employees
  // Fetch employees when the component mounts
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Function to fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${apiUrl}/tasks/list`);
      if (response.data.success) {
        setEmployees(response.data.employees); // Set the employees state
      } else {
        console.error("Failed to fetch employees:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Fetch available projects
  const fetchProjects = () => {
    axios
      .get(`${apiUrl}/projects`)
      .then((res) => {
        if (res.data.success) {
          setProjects(res.data.projects);
        }
      })
      .catch((err) => console.error("Error fetching projects:", err));
  };

  // Handle adding a new task
  const handleAddTask = () => {
    axios
      .post(`${apiUrl}/tasks`, {
        ...newTask,
        project_id: newTask.project_id || projectId,
      })
      .then((res) => {
        if (res.data.success) {
          setTasks([...tasks, res.data.task]); // Update UI
          setShowModal(false);
          setNewTask({
            description: "",
            employee_ids: [],
            deadline: "",
            project_id: projectId || "",
            status: "pending", // reset status to default
          });

          socket.emit("taskAssigned", res.data.task); // Notify employee
        }
      })
      .catch((err) => console.error("Error adding task:", err));
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId) => {
    axios
      .delete(`${apiUrl}/tasks/${taskId}`)
      .then((res) => {
        if (res.data.success) {
          // Remove the deleted task from local state
          setTasks((prevTasks) =>
            prevTasks.filter((t) => t.task_id !== taskId)
          );
        }
      })
      .catch((err) => console.error("Error deleting task:", err));
  };

  // Handle opening the edit modal
  const openEditModal = (task) => {
    setEditTask(task);
    setShowEditModal(true);
  };

  // Handle editing a task
  const handleEditTask = () => {
    axios
      .put(`${apiUrl}/tasks/${editTask.task_id}`, editTask)
      .then((res) => {
        if (res.data.success) {
          // Update local state so the changes reflect
          setTasks((prevTasks) =>
            prevTasks.map((t) =>
              t.task_id === editTask.task_id ? res.data.task : t
            )
          );
          setShowEditModal(false);
          setEditTask(null);
        }
      })
      .catch((err) => console.error("Error updating task:", err));
  };

  // Handle filtering tasks
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesProject = filter.project
      ? task.project_id === parseInt(filter.project)
      : true;
    const matchesEmployee = filter.employee
      ? task.employee_ids.includes(parseInt(filter.employee))
      : true;
    return matchesProject && matchesEmployee;
  });

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Project Tasks</h2>
      <Row className="mb-3">
        <Col>
          <Form.Select
            name="project"
            value={filter.project}
            onChange={handleFilterChange}
          >
            <option value="">Filter by Project</option>
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.title}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col>
          <Form.Select
            name="employee"
            value={filter.employee}
            onChange={handleFilterChange}
          >
            <option value="">Filter by Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Button
        variant="success"
        className="mb-3"
        onClick={() => setShowModal(true)}
      >
        + Add New Task
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Description</th>
            <th>Assigned Employees</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task.task_id}>
              <td>{task.task_id}</td>
              <td>{task.description}</td>
              <td>{task.employee_names?.join(", ") || "N/A"}</td>
              <td>
                {task.deadline
                  ? new Date(task.deadline).toLocaleString()
                  : "N/A"}
              </td>
              <td>{task.status}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => openEditModal(task)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteTask(task.task_id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Adding Task */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assign To</Form.Label>
              <Form.Control
                as="select"
                multiple
                value={newTask.employee_ids}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    employee_ids: Array.from(
                      e.target.selectedOptions,
                      (option) => parseInt(option.value, 10)
                    ),
                  })
                }
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role}) - ID: {emp.id}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Project</Form.Label>
              <Form.Control
                as="select"
                value={newTask.project_id}
                onChange={(e) =>
                  setNewTask({ ...newTask, project_id: e.target.value })
                }
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.title}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deadline</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newTask.deadline}
                onChange={(e) =>
                  setNewTask({ ...newTask, deadline: e.target.value })
                }
              />
            </Form.Group>

            <Button variant="primary" onClick={handleAddTask}>
              Assign Task
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Editing Task */}
      {editTask && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Task Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Enter task description"
                  value={editTask.description}
                  onChange={(e) =>
                    setEditTask({ ...editTask, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Assign To</Form.Label>
                <Form.Control
                  as="select"
                  multiple
                  value={editTask.employee_ids}
                  onChange={(e) =>
                    setEditTask({
                      ...editTask,
                      employee_ids: Array.from(
                        e.target.selectedOptions,
                        (option) => parseInt(option.value, 10)
                      ),
                    })
                  }
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role}) - ID: {emp.id}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Project</Form.Label>
                <Form.Control
                  as="select"
                  value={editTask.project_id}
                  onChange={(e) =>
                    setEditTask({ ...editTask, project_id: e.target.value })
                  }
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.title}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Deadline</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={editTask.deadline}
                  onChange={(e) =>
                    setEditTask({ ...editTask, deadline: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={editTask.status}
                  onChange={(e) =>
                    setEditTask({ ...editTask, status: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Form.Control>
              </Form.Group>

              <Button variant="primary" onClick={handleEditTask}>
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default AdminTasks;

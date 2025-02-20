import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";

const socket = io("http://localhost:3000");

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    status: "Not Started",
    completion_date: "",
    start_date: "",
    priority: "Medium",
    client_id: "",
  });
  const [editProject, setEditProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("all");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProjects();
    fetchClients();

    // Listen for real-time updates
    socket.on("taskUpdated", (updatedTask) => {
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.project_id === updatedTask.project_id) {
            return {
              ...project,
              taskCount:
                project.taskCount +
                (updatedTask.status === "completed" ? -1 : 1),
            };
          }
          return project;
        })
      );
    });

    return () => {
      socket.off("taskUpdated");
    };
  }, []);

  const fetchProjects = () => {
    axios
      .get(`${apiUrl}/projects`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setProjects(res.data.projects);
        }
      })
      .catch((err) => console.error("Error fetching projects:", err));
  };

  const fetchClients = () => {
    axios
      .get(`${apiUrl}/clients`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setClients(res.data.clients);
        }
      })
      .catch((err) => console.error("Error fetching clients:", err));
  };

  const handleAddProject = () => {
    const token = localStorage.getItem("jwt"); // Assuming the token is stored in localStorage
    axios
      .post(`${apiUrl}/projects`, newProject, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setProjects([...projects, res.data.project]); // Update UI
          setShowModal(false);
          setNewProject({
            title: "",
            description: "",
            status: "Not Started",
            completion_date: "",
            start_date: "",
            priority: "Medium",
            client_id: "",
          });
        }
      })
      .catch((err) => console.error("Error adding project:", err));
  };

  const handleEditProject = () => {
    const token = localStorage.getItem("jwt"); // Assuming the token is stored in localStorage
    axios
      .put(`${apiUrl}/projects/${editProject.project_id}`, editProject, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setProjects((prevProjects) =>
            prevProjects.map((project) =>
              project.project_id === editProject.project_id
                ? res.data.project
                : project
            )
          );
          setShowEditModal(false);
          setEditProject(null);
        }
      })
      .catch((err) => console.error("Error editing project:", err));
  };

  const handleDeleteProject = () => {
    const token = localStorage.getItem("jwt"); // Assuming the token is stored in localStorage
    axios
      .delete(`${apiUrl}/projects/${projectToDelete.project_id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setProjects((prevProjects) =>
            prevProjects.filter(
              (project) => project.project_id !== projectToDelete.project_id
            )
          );
          setShowDeleteModal(false);
          setProjectToDelete(null);
        }
      })
      .catch((err) => console.error("Error deleting project:", err));
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    const now = new Date();
    const projectDate = new Date(project.start_date);
    if (filter === "today") {
      return (
        projectDate.getDate() === now.getDate() &&
        projectDate.getMonth() === now.getMonth() &&
        projectDate.getFullYear() === now.getFullYear()
      );
    }
    if (filter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return projectDate >= oneWeekAgo && projectDate <= now;
    }
    if (filter === "month") {
      return (
        projectDate.getMonth() === now.getMonth() &&
        projectDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  return (
    <Container className="mt-2 p-5">
      <h2 className="mb-3">Project Management</h2>
      <Button
        variant="success"
        className="mb-3"
        onClick={() => setShowModal(true)}
      >
        + Create New Project
      </Button>

      <Form.Select
        className="mb-3"
        value={filter}
        onChange={handleFilterChange}
      >
        <option value="all">All Projects</option>
        <option value="today">Today's Projects</option>
        <option value="week">This Week's Projects</option>
        <option value="month">This Month's Projects</option>
      </Form.Select>

      <Row>
        {filteredProjects.map((project) => (
          <Col md={6} key={project.project_id} className="mb-2">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{project.title}</Card.Title>
                <Card.Text>{project.description}</Card.Text>
                <p>
                  <strong>Status:</strong> {project.status}
                </p>
                <p>
                  <strong>Priority:</strong> {project.priority}
                </p>
                <p>
                  <strong>Client:</strong>{" "}
                  {clients.find(
                    (client) => client.client_id === project.client_id
                  )?.name || "N/A"}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Completion Date:</strong>{" "}
                  {project.completion_date
                    ? new Date(project.completion_date).toLocaleDateString()
                    : "N/A"}
                </p>
                <Button
                  variant="info"
                  className="me-2"
                  onClick={() => {
                    setEditProject(project);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setProjectToDelete(project);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal for Creating New Project */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter project title"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={newProject.status}
                onChange={(e) =>
                  setNewProject({ ...newProject, status: e.target.value })
                }
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Completion Date</Form.Label>
              <Form.Control
                type="date"
                value={newProject.completion_date}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    completion_date: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={newProject.start_date}
                onChange={(e) =>
                  setNewProject({ ...newProject, start_date: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={newProject.priority}
                onChange={(e) =>
                  setNewProject({ ...newProject, priority: e.target.value })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Client</Form.Label>
              <Form.Select
                value={newProject.client_id}
                onChange={(e) =>
                  setNewProject({ ...newProject, client_id: e.target.value })
                }
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" onClick={handleAddProject}>
              Create Project
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Editing Project */}
      {editProject && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Project Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter project title"
                  value={editProject.title}
                  onChange={(e) =>
                    setEditProject({ ...editProject, title: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Enter project description"
                  value={editProject.description}
                  onChange={(e) =>
                    setEditProject({
                      ...editProject,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editProject.status}
                  onChange={(e) =>
                    setEditProject({ ...editProject, status: e.target.value })
                  }
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Canceled">Canceled</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Completion Date</Form.Label>
                <Form.Control
                  type="date"
                  value={editProject.completion_date}
                  onChange={(e) =>
                    setEditProject({
                      ...editProject,
                      completion_date: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={editProject.start_date}
                  onChange={(e) =>
                    setEditProject({
                      ...editProject,
                      start_date: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={editProject.priority}
                  onChange={(e) =>
                    setEditProject({ ...editProject, priority: e.target.value })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Client</Form.Label>
                <Form.Select
                  value={editProject.client_id}
                  onChange={(e) =>
                    setEditProject({
                      ...editProject,
                      client_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Button variant="primary" onClick={handleEditProject}>
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Modal for Deleting Project */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the project` {projectToDelete?.title}
          `?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProject}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminProjects;

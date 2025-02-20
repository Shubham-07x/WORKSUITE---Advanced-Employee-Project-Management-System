import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Container } from "react-bootstrap";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });
  const [clientToDelete, setClientToDelete] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    axios
      .get(`${apiUrl}/clients`)
      .then((res) => {
        if (res.data.success) {
          setClients(res.data.clients);
        }
      })
      .catch((err) => console.error("Error fetching clients:", err));
  };

  const handleAddClient = () => {
    axios
      .post(`${apiUrl}/clients`, newClient)
      .then((res) => {
        if (res.data.success) {
          setClients([...clients, res.data.client]);
          setShowAddModal(false);
          setNewClient({
            name: "",
            contact_person: "",
            email: "",
            phone: "",
            address: "",
          });
        }
      })
      .catch((err) => console.error("Error adding client:", err));
  };

  const handleDeleteClient = () => {
    axios
      .delete(`${apiUrl}/clients/${clientToDelete.client_id}`)
      .then((res) => {
        if (res.data.success) {
          setClients(
            clients.filter(
              (client) => client.client_id !== clientToDelete.client_id
            )
          );
          setShowDeleteModal(false);
          setClientToDelete(null);
        }
      })
      .catch((err) => console.error("Error deleting client:", err));
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Clients</h2>
      <Button
        variant="success"
        className="mb-3"
        onClick={() => setShowAddModal(true)}
      >
        + Add New Client
      </Button>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Client ID</th>
            <th>Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.client_id}>
              <td>{client.client_id}</td>
              <td>{client.name}</td>
              <td>{client.contact_person}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.address}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setClientToDelete(client);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Adding Client */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter client name"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact person"
                value={newClient.contact_person}
                onChange={(e) =>
                  setNewClient({ ...newClient, contact_person: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                value={newClient.phone}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter address"
                value={newClient.address}
                onChange={(e) =>
                  setNewClient({ ...newClient, address: e.target.value })
                }
              />
            </Form.Group>
            <Button variant="primary" onClick={handleAddClient}>
              Add Client
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Deleting Client */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the client `{clientToDelete?.name}`?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteClient}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Clients;

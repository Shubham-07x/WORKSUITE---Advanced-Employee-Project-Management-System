import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Office() {
  const [officeLocations, setOfficeLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch office locations from the backend API
    axios.get(`${apiUrl}/employee/office_location`)
      .then(response => {
        setOfficeLocations(response.data.officeLocations);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching office locations:', error);
        setLoading(false);
      });
  }, []);

  const handleDeleteLocation = (id) => {
    // Delete office location by ID
    axios.delete(`${apiUrl}/employee/office_location/${id}`)
      .then(response => {
        // Remove the deleted location from the state
        setOfficeLocations(officeLocations.filter(location => location.id !== id));
        setSuccessMessage('Office location deleted successfully.');
      })
      .catch(error => {
        console.error('Error deleting office location:', error);
        setError('An error occurred while deleting office location.');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${apiUrl}/employee/office_location`, newLocation)
      .then(response => {
        setOfficeLocations([...officeLocations, response.data.officeLocation]);
        setNewLocation({ name: '', latitude: '', longitude: '', address: '' });
        setSuccessMessage('Office location added successfully.');
      })
      .catch(error => {
        console.error('Error adding office location:', error);
        setError('An error occurred while adding office location.');
      });
  };

  return (
    <div className="container px-5">
      <h2 className="mt-5 mb-4">Office Locations</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul className="list-group">
            {officeLocations.map(location => (
              <li key={location.id} className="list-group-item d-flex justify-content-between align-items-center">
                {location.name} - Latitude: {location.latitude}, Longitude: {location.longitude}, Address: {location.address}
                <button onClick={() => handleDeleteLocation(location.id)} className="btn btn-danger">Delete</button>
              </li>
            ))}
          </ul>
          {error && <p className="text-danger mt-3">Error: {error}</p>}
          {successMessage && <p className="text-success mt-3">{successMessage}</p>}
          <h2 className="mt-5">Add New Office Location</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nameInput" className="form-label">Name:</label>
              <input type="text" className="form-control" id="nameInput" value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label htmlFor="latitudeInput" className="form-label">Latitude:</label>
              <input type="text" className="form-control" id="latitudeInput" value={newLocation.latitude} onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label htmlFor="longitudeInput" className="form-label">Longitude:</label>
              <input type="text" className="form-control" id="longitudeInput" value={newLocation.longitude} onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label htmlFor="addressInput" className="form-label">Address:</label>
              <input type="text" className="form-control" id="addressInput" value={newLocation.address} onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary">Add Location</button>
          </form>
        </>
      )}
    </div>
  );
}

export default Office;

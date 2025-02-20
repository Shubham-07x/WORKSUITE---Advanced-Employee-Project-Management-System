import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap-icons/font/bootstrap-icons.css";

const ClockIn = () => {
    const { id } = useParams();
    const [location, setLocation] = useState('office');
    const [workFromType, setWorkFromType] = useState('office');
    const [loading, setLoading] = useState(false);
    const [clockedIn, setClockedIn] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [officeLocations, setOfficeLocations] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Fetch office location data when component mounts
        const fetchOfficeLocations = async () => {
            try {
                const response = await axios.get(`${apiUrl}/employee/office_location`);
                setOfficeLocations(response.data.officeLocations);

                // Check local storage for clock-in status
                const clockInStatus = localStorage.getItem('clockInStatus');
                if (clockInStatus) {
                    setClockedIn(JSON.parse(clockInStatus));
                }
            } catch (error) {
                console.error('Error fetching office locations:', error);
            }
        };

        fetchOfficeLocations();
    }, []);

    const updateClockInStatus = (status) => {
        localStorage.setItem('clockInStatus', JSON.stringify(status));
        setClockedIn(status);
    };

    const handleClockIn = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (location === 'home') {
            try {
                const response = await axios.post(`${apiUrl}/employee/employee_clockin/${id}`, {
                    work_from_type: 'Home'
                });
                if (response.data.status === 'success') {
                    console.log('Clock-in successful');
                    updateClockInStatus(true);
                    setShowModal(false);
                    toast.success('Clock-in successful');
                }
            } catch (error) {
                console.error('Error while clocking in:', error);
            } finally {
                setLoading(false);
            }
        } else {
            // Get user's current location
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const userLatitude = position.coords.latitude;
                    const userLongitude = position.coords.longitude;

                    // Log employee's current location
                    console.log('Employee Current Location:', userLatitude, userLongitude);

                    // Compare user's location with office locations
                    const isAtOfficeLocation = checkOfficeLocation(userLatitude, userLongitude);

                    // Log office locations
                    console.log('Office Locations:', officeLocations);

                    if (!isAtOfficeLocation) {
                        setLoading(false);
                        toast.error('You are not at the office location.');
                        console.error('Employee is not at the office location.');
                        return;
                    }

                    try {
                        const response = await axios.post(`${apiUrl}/employee/employee_clockin/${id}`, {
                            work_from_type: 'Office'
                        });
                        if (response.data.status === 'success') {
                            console.log('Clock-in successful');
                            updateClockInStatus(true);
                            setShowModal(false);
                            toast.success('Clock-in successful');
                        }
                    } catch (error) {
                        console.error('Error while clocking in:', error);
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    setLoading(false);
                    toast.error('Error getting your location. Please try again.');
                }
            );
        }
    };


    const checkOfficeLocation = (userLatitude, userLongitude) => {
        // Iterate through office locations and check if user's location matches any office location
        for (const officeLocation of officeLocations) {
            const officeLatitude = officeLocation.latitude;
            const officeLongitude = officeLocation.longitude;
            const YOUR_TOLERANCE = 5; // Adjust tolerance as needed
            const distance = calculateDistance(userLatitude, userLongitude, officeLatitude, officeLongitude);
            if (distance <= YOUR_TOLERANCE) {
                return true;
            }
        }
        return false;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        // Calculation of distance between two points using haversine formula
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    const handleClockOut = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/employee/employee_clockout/${id}`);
            if (response.data.success) {
                console.log('Clock-out successful');
                updateClockInStatus(false);
                toast.success('Clock-out successful');
            }
        } catch (error) {
            console.error('Error while clocking out:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {!clockedIn && (
                <button type="button" className="btn btn-primary d-flex align-items-center" onClick={() => setShowModal(true)}>
                    <i className="fs-5 bi bi-box-arrow-in-right" style={{marginRight:'5px'}}></i>
                    Clock In
                </button>
            )}
            {showModal && (
                <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Clock In</h5>
                                <span aria-hidden="true" style={{ color: '#999', fontSize: '24px', position: 'absolute', top: '8px', right: '12px', cursor: 'pointer' }} onClick={() => setShowModal(false)}>&times;</span>
                            </div>
                            <form onSubmit={handleClockIn}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label htmlFor="location" style={{ display: 'flex', alignItems: 'center', textAlign: 'left', marginTop: '10px', marginBottom: '10px' }}>Location</label>
                                        <select className="form-control" id="location" value={location} onChange={(e) => setLocation(e.target.value)}>
                                            <option value="office">Office</option>
                                            <option value="home">Home</option>
                                        </select>
                                    </div>
                                    {location === 'office' && (
                                        <div className="form-group">
                                            <label htmlFor="work_from_type" style={{ display: 'flex', alignItems: 'center', textAlign: 'left', marginTop: '10px', marginBottom: '10px' }}>Working From</label>
                                            <select className="form-control" id="work_from_type" value={workFromType} onChange={(e) => setWorkFromType(e.target.value)}>
                                                <option value="office">Office</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>Clock In</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {clockedIn && (
                <div>
                    <button type="button" className="btn btn-danger" onClick={handleClockOut} disabled={loading}>
                    <i className="fs-5 bi bi-box-arrow-right" style={{marginRight:'5px'}}></i> Clock Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClockIn;

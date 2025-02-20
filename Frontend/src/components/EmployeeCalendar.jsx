import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar'; // Assuming you're using react-calendar library
import 'react-calendar/dist/Calendar.css';
import './EmployeeCalendar.css';

function EmployeeCalendar({ employeeId }) {
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Initialize selectedDate with current date
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, [employeeId]); 

  
  const fetchData = () => {
    const formattedDate = selectedDate.toISOString().slice(0, 10); // Format date as 'YYYY-MM-DD'
    axios.get(`${apiUrl}/employee/calendar/${employeeId}?date=${formattedDate}`)
      .then(result => {
        if (result.data.success && Array.isArray(result.data.calendarData)) {
          setCalendarData(result.data.calendarData);
        } else {
          console.error("Invalid response format:", result.data);
        }
      })
      .catch(err => console.error(err));
  };

  // Function to format timestamp strings
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US');
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', marginTop: '60px' }}>
      <h2 className='text-center mt-5'>Attendance Calendar</h2>
      {/* Render the calendar component */}
      <div style={{ marginTop: '30px', paddingBottom: '60px', width: '100%' }}>
        <Calendar
          onChange={setSelectedDate} // Update selectedDate when the user selects a new date
          value={selectedDate} // Set the value of the calendar to selectedDate
          tileContent={({ date }) => {
            const formattedDate = date.toDateString();
            const entries = calendarData.filter(entry => {
              const entryDate = new Date(entry.clockIn).toDateString();
              return entryDate === formattedDate;
            });
            return (
              <div>
                {entries.map((entry, index) => (
                  <div key={index}>
                    <p className='calendarPara'><strong>{entry.dayName}</strong></p>
                    <p className='calendarPara'>Clock In: <br /> {formatDate(entry.clockIn)}</p>
                    <p className='calendarPara'>Clock Out: <br /> {formatDate(entry.clockOut)}</p>
                    {entry.location && <p>Location: {entry.location}</p>}
                    <p className='calendarPara'>Work From Type: {entry.workFromType}</p>
                  </div>
                ))}
              </div>
            );
          }}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

export default EmployeeCalendar;

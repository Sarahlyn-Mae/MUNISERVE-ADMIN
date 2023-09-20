import React from 'react';
import Sidebar from '../components/sidebar';
import './appointment.css';

const AppointmentPage = () => {
    return (
        <div>
        <Sidebar />
        <div className="appointment-page">
            <h1>My Appointments</h1>
            <div className="appointment-list">
                {/* List of Appointments */}
                <div className="appointment-item">
                    <h3>Appointment with Dr. Smith</h3>
                    <p>Date: July 15, 2023</p>
                    <p>Time: 2:30 PM</p>
                </div>
                <div className="appointment-item">
                    <h3>Appointment with Dr. Johnson</h3>
                    <p>Date: July 20, 2023</p>
                    <p>Time: 10:00 AM</p>
                </div>
                {/* Add more appointment items as needed */}
            </div>
            <div className="appointment-form">
                {/* Appointment Booking Form */}
                <h2>Book an Appointment</h2>
                <form>
                    <label htmlFor="doctor">Select a Doctor:</label>
                    <select id="doctor" name="doctor">
                        <option value="dr-smith">Dr. Smith</option>
                        <option value="dr-johnson">Dr. Johnson</option>
                        {/* Add more options for doctors */}
                    </select>
                    <label htmlFor="date">Select a Date:</label>
                    <input type="date" id="date" name="date" />
                    <label htmlFor="time">Select a Time:</label>
                    <input type="time" id="time" name="time" />
                    <button type="submit">Book Appointment</button>
                </form>
            </div>
        </div>
    </div>
    );
};

export default AppointmentPage;
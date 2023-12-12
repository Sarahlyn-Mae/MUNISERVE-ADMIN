import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import './dashboard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import notification from '../assets/icons/Notification.png';
import logo from '../assets/logo.png'
import { BsClipboardCheckFill, BsClockHistory, BsCheckCircleFill, BsXCircleFill }
  from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line }
  from 'recharts';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Chart from "react-apexcharts";
import { format, isValid } from 'date-fns';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsIqHHA8727cGeTjr0dUQQmttqJ2nW_IE",
  authDomain: "muniserve-4dc11.firebaseapp.com",
  projectId: "muniserve-4dc11",
  storageBucket: "muniserve-4dc11.appspot.com",
  messagingSenderId: "874813480248",
  appId: "1:874813480248:web:edd1ff1f128b5bb4a2b5cd",
  measurementId: "G-LS66HXR3GT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const Dashboard = ({ count }) => {

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ... existing code
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const filteredData = querySnapshot.docs
          .filter((doc) => {
            const appointmentData = doc.data();
            const date = new Date(appointmentData.createdAt);
            return date >= startOfDay && date <= endOfDay;
          });

        // ... remaining code remains the same
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        // Handle error here
      }
    };

    fetchData();
  }, [selectedDate]);

  const [barChartData, setBarChartData] = useState({
    options: {
      colors: ["#8884d8", "#82ca9d", "#FF5733"],
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [],
      },
    },
    series: [
      {
        name: "Pending",
        data: [],
      },
      {
        name: "Approved",
        data: [],
      },
      {
        name: "Disapproved",
        data: [],
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentCollection = collection(firestore, "appointments");
        const querySnapshot = await getDocs(appointmentCollection);

        const counts = {
          pending: 0,
          approved: 0,
          disapproved: 0,
        };

        const categories = [];

        querySnapshot.forEach((doc) => {
          const appointmentData = doc.data();

          if (appointmentData.status === "Pending") {
            counts.pending += 1;
          } else if (appointmentData.status === "Approved") {
            counts.approved += 1;
          } else if (appointmentData.status === "Disapproved") {
            counts.disapproved += 1;
          }

          // Assuming your data has a createdAt field for x-axis
          // Make sure createdAt is a valid date string or a timestamp
          const date = new Date(appointmentData.createdAt);
          categories.push(date.toLocaleDateString()); // Adjust the format if needed
        });

        console.log("Fetched Data:", counts, categories);

        setBarChartData((prevData) => ({
          ...prevData,
          options: {
            ...prevData.options,
            xaxis: {
              ...prevData.options.xaxis,
              categories: categories,
            },
          },
          series: [
            {
              name: "Pending",
              data: [counts.pending],
            },
            {
              name: "Approved",
              data: [counts.approved],
            },
            {
              name: "Disapproved",
              data: [counts.disapproved],
            },
          ],
        }));
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        // Handle error here
      }
    };

    fetchData();
  }, []);

  console.log("Rendering Data:", barChartData);

  const [transactionCounts, setTransactionCounts] = useState({
    pendingCount: 0,
    completedCount: 0,
    approvedCount: 0,
    disapprovedCount: 0,
    Appointments: 0,
  });

  const fetchAppointmentCounts = async () => {
    try {
      const snapshot = await firebase.firestore().collection('appointments').get();
      const data = snapshot.docs.map((doc) => doc.data());

      const pendingCount = data.filter((appointment) => appointment.status === 'Pending').length;
      const completedCount = data.filter((appointment) => appointment.status === 'Completed').length;
      const approvedCount = data.filter((appointment) => appointment.status === 'Approved').length;
      const disapprovedCount = data.filter((appointment) => appointment.status === 'Disapproved').length;

      setTransactionCounts({
        pendingCount,
        completedCount,
        approvedCount,
        disapprovedCount,
        Appointments: data.length,
      });

      return { pendingCount, completedCount, approvedCount, disapprovedCount };
    } catch (error) {
      console.error('Error fetching transaction counts:', error);
      return {
        pendingCount: 0,
        completedCount: 0,
        approvedCount: 0,
        disapprovedCount: 0,
        Appointments: 0,
      };
    }
  };

  return (
    <main className='main-container'>
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className='container'>
        <div className="header">
          <div className='icons'>
            <h1>Dashboard</h1>
            <img src={notification} alt="Notification.png" className='notif' />
            <img src={logo} alt="logo" className='account-img' />
            <div className='account-name'><h1>Admin</h1></div>
          </div>
        </div>

        <div className='main-cards'>

          <div className='card'>
            <div className='card-inner'>
              <h3>Total No. of Service Requests</h3>
              <BsClipboardCheckFill className='card_icon' />
            </div>
            <h2>{transactionCounts.Appointments}</h2>
          </div>

          <div className='card'>
            <div className='card-inner'>
              <h3>Pending</h3>
              <BsClockHistory className='card_icon' />
            </div>
            <h2>{transactionCounts.pendingCount}</h2>
          </div>

          <div className='card'>
            <div className='card-inner'>
              <h3>Completed</h3>
              <BsCheckCircleFill className='card_icon' />
            </div>
            <h2>{transactionCounts.completedCount}</h2>
          </div>

          <div className='card'>
            <div className='card-inner'>
              <h3>Disapproved</h3>
              <BsXCircleFill className='card_icon' />
            </div>
            <h2>{transactionCounts.disapprovedCount}</h2>
          </div>

          <div className='card'>
            <div className='card-inner'>
              <h3>Approved</h3>
              <BsCheckCircleFill className='card_icon' />
            </div>
            <h2>{transactionCounts.approvedCount}</h2>
          </div>
        </div>
        
        {/* Date Picker */}
        <div className="date-picker">
          <label>Select Date: </label>
          <DatePicker selected={selectedDate} onChange={handleDateChange} />
        </div>

        {barChartData.options && barChartData.series && (
          <div className='charts'>
            <div className="row">
              <div className="col-4">
                <Chart
                  options={barChartData.options}
                  series={barChartData.series}
                  type="bar"
                  width="450"
                />
              </div>

              <div className="col-4">
                < Chart
                  options={barChartData.options}
                  series={barChartData.series}
                  type="line"
                  width="450"
                />
              </div>

              <div className="col-4">
                <Chart
                  options={barChartData.options}
                  series={barChartData.series}
                  type="area"
                  width="450"
                />
              </div>

              <div className="col-4">
                <Chart
                  options={barChartData.options}
                  series={barChartData.series}
                  type="scatter"
                  width="450"
                />
              </div>

            </div>
          </div>
        )}

      </div>
    </main> 
  );
};

export default Dashboard;
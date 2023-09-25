import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import './dashboard.css';
import { BsClipboardCheckFill, BsClockHistory, BsCheckCircleFill, BsXCircleFill }
  from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line }
  from 'recharts';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";


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

  const fetchTotalAppointments = async () => {
    try {
      const snapshot = await firebase.firestore().collection('appointments').get();
      const totalAppointments = snapshot.size; // Get the number of documents in the collection

      return totalAppointments;
    } catch (error) {
      console.error('Error fetching total appointments:', error);
      return 0;
    }
  };

  const fetchTransactionCounts = async () => {
    try {
      const snapshot = await firebase.firestore().collection('appointments').get();
      const data = snapshot.docs.map((doc) => doc.data());

      // Calculate counts based on the data
      const pendingCount = data.filter((appointments) => appointments.status === 'Pending').length;
      const completedCount = data.filter((appointments) => appointments.status === 'Completed').length;
      const approvedCount = data.filter((appointments) => appointments.status === 'Approved').length;
      const disapprovedCount = data.filter((appointments) => appointments.status === 'Disapproved').length;

      return { pendingCount, completedCount, approvedCount, disapprovedCount };
    } catch (error) {
      console.error('Error fetching transaction counts:', error);
      return {
        pendingCount: 0,
        completedCount: 0,
        approvedCount: 0,
        disapprovedCount: 0,
      };
    }
  };
  const [transactionCounts, setTransactionCounts] = useState({
    pendingCount: 0,
    completedCount: 0,
    approvedCount: 0,
    disapprovedCount: 0,
  });

  const [totalAppointments, setTotalAppointments] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const counts = await fetchTransactionCounts();
      setTransactionCounts(counts);

      const appointments = await fetchTotalAppointments();
      setTotalAppointments(appointments);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const counts = await fetchTransactionCounts();
      setTransactionCounts(counts);
    };

    fetchData();
  }, []);

  // User Header
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Date and Time
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];


  return (
    <main className='main-container'>
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className='main-title'>
        <h1>DASHBOARD</h1>
      </div>

      <div className='main-cards'>
        <div className='card'>
          <div className='card-inner'>
            <h3>Total No. of Service Requests</h3>
            <BsClipboardCheckFill className='card_icon' />
          </div>
          <h2>{totalAppointments}</h2>
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
      </div>

      <div className='charts'>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" fill="#8884d8" />
            <Bar dataKey="uv" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

export default Dashboard;
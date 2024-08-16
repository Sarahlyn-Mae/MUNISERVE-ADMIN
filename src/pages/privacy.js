import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import { Link, useLocation, useHistory } from "react-router-dom";
import {
  faEdit,
  faTrashAlt,
  faPlus,
  faFileAlt,
  faLock,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import "./settings.css";
import useAuth from "../components/useAuth";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AdminSettings = () => {
  const [newUser, setNewUser] = useState({ id: null, name: "", email: "" });
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");

  // Function for the account name
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserEmail = () => {
      if (user) {
        const email = user?.email; // Use optional chaining to prevent null access
        const truncatedEmail =
          email.length > 10 ? `${email.substring(0, 10)}...` : email;
        setUserEmail(truncatedEmail);
      }
    };

    fetchUserEmail();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "admin_users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };

    fetchUsers();
  }, [db]);

  const openModal = (action, userId = null) => {
    setModalAction(action);
    if (action === "edit") {
      const userToEdit = users.find((user) => user.id === userId);
      setNewUser({ ...userToEdit });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalAction("");
    setNewUser({ name: "", email: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalAction === "add") {
      await addDoc(collection(db, "admin_users"), newUser);
    } else if (modalAction === "edit") {
      await updateDoc(doc(db, "admin_users", newUser.id), newUser);
    } else if (modalAction === "delete") {
      await deleteDoc(doc(db, "admin_users", newUser.id));
    }
    closeModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const addNewUser = async () => {
    try {
      await addDoc(collection(db, "admin_users"), newUser);
      closeModal();
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const editUser = async () => {
    try {
      await updateDoc(doc(db, "admin_users", newUser.id), newUser);
      closeModal();
    } catch (error) {
      console.error("Error editing user: ", error);
    }
  };

  const deleteUser = async () => {
    try {
      await deleteDoc(doc(db, "admin_users", newUser.id));
      closeModal();
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  return (
    <div className="container">
      <div className="headers" style={{ marginLeft: "50px" }}>
        <div className="icons">
          <div style={{ marginTop: "-20px" }}>
            <h1>Settings</h1>
          </div>

          <img src={notification} alt="Notification.png" className="notif" />
          <img src={logo} alt="logo" className="account-img" />
          <div className="account-names">
            <h2>{userEmail}</h2>
          </div>
        </div>
      </div>

      <div className="heading">
        <h4 style={{ textAlign: "center" }}>Privacy Policy</h4>
      </div>

      <div className="terms">
        <p>
          Welcome to Muniserve! This Privacy Policy outlines how we collect,
          use, disclose, and safeguard your information when you access and use
          our admin settings.
        </p>
        <h4>1. Account Information</h4>
        <p>
          When you create an admin account, we may collect your name, email
          address, and other necessary information to create and manage your
          account.
        </p>
        <h4>2. Admin Account Management</h4>
        <p>
          We use your account information to manage your admin settings, provide
          customer support, and communicate with you about your account.
        </p>
        <h4>3. Legal Compliance</h4>
        <p>
          We may disclose your information to comply with applicable laws,
          regulations, legal processes, or governmental requests.
        </p>
        <h4>4. Security</h4>
        <p>
          We implement security measures to protect your information from
          unauthorized access, alteration, disclosure, or destruction. However,
          no method of transmission over the internet or electronic storage is
          100% secure, and we cannot guarantee absolute security.
        </p>
        <h4>5. Your Choices and Rights</h4>
        <p>
          You have the right to access, correct, or delete your personal
          information. You can manage your preferences in the admin settings or
          contact us for assistance.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;

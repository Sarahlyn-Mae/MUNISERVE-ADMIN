import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import {
  faEdit,
  faTrashAlt,
  faPlus,
  faFileAlt,
  faLock,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import "./transactions.css";
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
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

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
const db = getFirestore(app);
const auth = getAuth();

const AdminSettings = () => {
  const { user } = useAuth();
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formAction, setFormAction] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState(""); // State to store the user's name

  useEffect(() => {
    const fetchUserData = () => {
      if (user) {
        const email = user?.email;
        const truncatedEmail =
          email.length > 10 ? `${email.substring(0, 10)}...` : email;
        setUserEmail(truncatedEmail);

        // Check if the user has a display name
        if (user.displayName) {
          setUserName(user.displayName);
        } else {
          // If not, set it to the email address
          setUserName(truncatedEmail);
        }
      }
    };

    fetchUserData();
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

  const openForm = (action, userId = null) => {
    setFormAction(action);
    setShowForm(true);
    if (action === "edit") {
      const userToEdit = users.find((user) => user.id === userId);
      setNewUser({ ...userToEdit });
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setFormAction("");
    setNewUser({ name: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formAction === "add") {
      await addNewUser();
    } else if (formAction === "edit") {
      await editUser();
    } else if (formAction === "delete") {
      await deleteUser();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const addNewUser = async () => {
    try {
      const { email, password, name } = newUser;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });
      await addDoc(collection(db, "admin_users"), { name, email });
      closeForm();
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const editUser = async () => {
    try {
      await updateDoc(doc(db, "admin_users", newUser.id), newUser);
      closeForm();
    } catch (error) {
      console.error("Error editing user: ", error);
    }
  };

  const deleteUser = async () => {
    try {
      await deleteDoc(doc(db, "admin_users", newUser.id));
      closeForm();
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  return (
        <div className="container">
          {showForm && <div className="dimmed"></div>}
          <div className="headers" style={{marginLeft: "50px"}}>
          <div className="icons">
            <div style={{marginTop: "-20px"}}><h1>Settings</h1></div>
            
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-names">
              <h2>{userEmail}</h2>
            </div>
          </div>
          </div>

          <div className="heading">
            <h4>Account Setting</h4>
          </div>

          <div className="admin-profile">
            <img src={logo} alt="Admin Profile" className="profile-image" />
            <div>
              <div className="user-container">
                <div className="user-info">
                  <h3>{user?.displayName || userName || "Admin"}</h3>
                  <p>{user?.email || userEmail}</p>
                </div>

                <div className="user-buttons">
                  <button onClick={() => openForm("add")}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>

                  <button onClick={() => openForm("edit", user?.id)}>
                    {/* Use optional chaining */}
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  <button onClick={() => openForm("delete", user?.id)}>
                    {/* Use optional chaining */}
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="form-container">
              <form onSubmit={handleSubmit}>
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="text"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Password:
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                  />
                </label>
                <div className="button-form">
                  <button type="submit" className="adds">
                    {formAction === "edit"
                      ? "Update"
                      : formAction === "add"
                      ? "Add"
                      : "Delete"}
                  </button>
                  <button type="button" onClick={closeForm} className="adds">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Other content */}
          <div>

            <Link to="helps" className="link">
              <div className="content-container">
                <span>
                  <FontAwesomeIcon icon={faTools} className="iconss" />
                </span>{" "}
                <span className="text">Helps</span>
              </div>
            </Link>

            <Link to="/terms" className="link">
              <div className="privacy-container">
                <span>
                  {" "}
                  <FontAwesomeIcon icon={faFileAlt} className="iconss" />
                </span>
                <span className="text"> Terms and Conditions</span>
              </div>
            </Link>

            <Link to="/privacy" className="link">
              <div className="privacy-container">
                <span>
                  <FontAwesomeIcon icon={faLock} className="iconss" />
                </span>{" "}
                <span className="text">Privacy Policy</span>
              </div>
            </Link>
          </div>
        </div>
  );
};

export default AdminSettings;

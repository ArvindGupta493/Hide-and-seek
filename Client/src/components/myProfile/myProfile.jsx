import { useState, useEffect } from "react";
import style from "./myProfile.module.css";
import logo from "../../assets/logo.png";

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });

  // Load user data on component mount
  useEffect(() => {
    const username = localStorage.getItem("username") || "John Doe"; // Default value
    const email = localStorage.getItem("email") || "johndoe@example.com"; // Default value
    const storedProfile = JSON.parse(localStorage.getItem("userProfile")) || {};

    setFormData({
      username,
      email,
      phone: storedProfile.phone || "",
      address: storedProfile.address || "",
    });
  }, []);

  // Handle input change for editable fields only
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Save
  const handleSave = () => {
    if (!formData.phone || !formData.address) {
      alert("Phone and Address are required!");
      return;
    }

    // Phone number validation (10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
      alert("Phone number must be 10 digits.");
      return;
    }

    // Save editable fields to localStorage (Simulating backend update)
    localStorage.setItem(
      "userProfile",
      JSON.stringify({ phone: formData.phone, address: formData.address })
    );

    alert("Profile updated successfully!");
    setIsEditing(false);
  };

  return (
    <div className={style.profileContainer}>
      <div className={style.logoContainer}>
        <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
      </div>

      <h1>My Profile</h1>
      <div className={style.profileForm}>
        {/* Username (Static) */}
        <label>Username:</label>
        <p>{formData.username}</p>

        {/* Email Address (Static) */}
        <label>Email Address:</label>
        <p>{formData.email}</p>

        {/* Editable Phone Number */}
        <label>Phone Number:</label>
        {isEditing ? (
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        ) : (
          <p>{formData.phone || "Not Set"}</p>
        )}

        {/* Editable Address */}
        <label>Address:</label>
        {isEditing ? (
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        ) : (
          <p>{formData.address || "Not Set"}</p>
        )}

        <div className={style.buttonGroup}>
          {isEditing ? (
            <button className={style.saveButton} onClick={handleSave}>Save</button>
          ) : (
            <button className={style.editButton} onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

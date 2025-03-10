import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./ContactUs.module.css";
import logo from "../../assets/logo.png";

const ContactUs = () => {
  const navigate = useNavigate();

  // State variables for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    screenshot: null,
    message: "",
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, screenshot: file });
    } else {
      setErrors({ ...errors, screenshot: "Only image files are allowed" });
    }
  };

  // Validation function
  const validateForm = () => {
    let validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }

    if (!formData.mobileNumber.trim()) {
      validationErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      validationErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    if (!formData.message.trim()) {
      validationErrors.message = "Message is required";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Message sent:", formData);
      setShowPopup(true); 
    }
  };
  

  return (
    <div className={style.contactContainer}>
        <div className={style.logoContainer}>
            <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
        </div>
      <h1>Contact Us</h1>
      <form onSubmit={handleSubmit}>

        <div className={style.inputGroup}>
          <label>Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <span className={style.error}>{errors.name}</span>}
        </div>

        <div className={style.inputGroup}>
          <label>Email *</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <span className={style.error}>{errors.email}</span>}
        </div>

        <div className={style.inputGroup}>
          <label>Mobile Number *</label>
          <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} maxLength="10" />
          {errors.mobileNumber && <span className={style.error}>{errors.mobileNumber}</span>}
        </div>

        <div className={style.inputGroup}>
          <label>Add Screenshot (Optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {errors.screenshot && <span className={style.error}>{errors.screenshot}</span>}
        </div>

        <div className={style.inputGroup}>
          <label>Message *</label>
          <textarea name="message" value={formData.message} onChange={handleChange}></textarea>
          {errors.message && <span className={style.error}>{errors.message}</span>}
        </div>

        <button type="submit" className={style.submitButton}>Submit</button>
      </form>
        {showPopup && (
            <div className={style.popupOverlay}>
              <div className={style.popupBox}>
                <p>Your request has been submitted successfully!</p>
                <button onClick={() => navigate("/home")}>OK</button>
              </div>
            </div>
        )}
      {/* <button className={style.backButton} onClick={() => navigate(-1)}>Back</button> */}
    </div>
  );
};

export default ContactUs;

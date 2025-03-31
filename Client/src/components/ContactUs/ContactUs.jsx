import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import style from "./ContactUs.module.css";
import logo from "../../assets/logo.png";

const ContactUs = () => {
  const navigate = useNavigate();

  // State variables for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image:"",
    mobileNumber: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
        setFormData({ ...formData, image: file });  // Store file object
    } else {
        setErrors({ ...errors, image: "Only image files are allowed" });
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
        const token = localStorage.getItem("token");

        // Create FormData object to send file
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("mobileNumber", formData.mobileNumber);
        formDataToSend.append("message", formData.message);
        if (formData.image) {
            formDataToSend.append("image", formData.image); // Attach image file
        }

        const response = await axios.post(
            "http://localhost:5000/api/user/contactUsNotifications",
            formDataToSend,  // Send FormData instead of JSON
            { headers: { 
                Authorization: `Bearer ${token}`, 
                "Content-Type": "multipart/form-data"  // Required for file upload
            }}
        );

        if (response.data.success) {
            setShowPopup(true);
        }
    } catch (error) {
        console.error("Error sending message:", error);
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
    </div>
  );
};

export default ContactUs;


// why the image is not being updated in the database
// the image is not being updated in the database because the image is not being sent in the request body when the notification api is called so update it in the notification api so that the image is also sent in the request body when the notification api is called

// update the notification backend so that the updaload image is also saved in the database image can be get from the request body when notification api is called























































// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import style from "./ContactUs.module.css";
// import logo from "../../assets/logo.png";

// const ContactUs = () => {
//   const navigate = useNavigate();

//   // State variables for form fields
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobileNumber: "",
//     screenshot: null,
//     message: "",
//   });

//   const [errors, setErrors] = useState({});

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Handle file input
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type.startsWith("image/")) {
//       setFormData({ ...formData, screenshot: file });
//     } else {
//       setErrors({ ...errors, screenshot: "Only image files are allowed" });
//     }
//   };

//   // Validation function
//   const validateForm = () => {
//     let validationErrors = {};

//     if (!formData.name.trim()) {
//       validationErrors.name = "Name is required";
//     }

//     if (!formData.email.trim()) {
//       validationErrors.email = "Email is required";
//     } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
//       validationErrors.email = "Invalid email format";
//     }

//     if (!formData.mobileNumber.trim()) {
//       validationErrors.mobileNumber = "Mobile number is required";
//     } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
//       validationErrors.mobileNumber = "Mobile number must be 10 digits";
//     }

//     if (!formData.message.trim()) {
//       validationErrors.message = "Message is required";
//     }

//     setErrors(validationErrors);
//     return Object.keys(validationErrors).length === 0;
//   };
  
  
//   const [showPopup, setShowPopup] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (validateForm()) {
//       console.log("Message sent:", formData);
//       setShowPopup(true); 
//     }
//   };
  

//   return (
//     <div className={style.contactContainer}>
//         <div className={style.logoContainer}>
//             <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
//         </div>
//       <h1>Contact Us</h1>
//       <form onSubmit={handleSubmit}>

//         <div className={style.inputGroup}>
//           <label>Name *</label>
//           <input type="text" name="name" value={formData.name} onChange={handleChange} />
//           {errors.name && <span className={style.error}>{errors.name}</span>}
//         </div>

//         <div className={style.inputGroup}>
//           <label>Email *</label>
//           <input type="email" name="email" value={formData.email} onChange={handleChange} />
//           {errors.email && <span className={style.error}>{errors.email}</span>}
//         </div>

//         <div className={style.inputGroup}>
//           <label>Mobile Number *</label>
//           <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} maxLength="10" />
//           {errors.mobileNumber && <span className={style.error}>{errors.mobileNumber}</span>}
//         </div>

//         <div className={style.inputGroup}>
//           <label>Add Screenshot (Optional)</label>
//           <input type="file" accept="image/*" onChange={handleFileChange} />
//           {errors.screenshot && <span className={style.error}>{errors.screenshot}</span>}
//         </div>

//         <div className={style.inputGroup}>
//           <label>Message *</label>
//           <textarea name="message" value={formData.message} onChange={handleChange}></textarea>
//           {errors.message && <span className={style.error}>{errors.message}</span>}
//         </div>

//         <button type="submit" className={style.submitButton}>Submit</button>
//       </form>
//         {showPopup && (
//             <div className={style.popupOverlay}>
//               <div className={style.popupBox}>
//                 <p>Your request has been submitted successfully!</p>
//                 <button onClick={() => navigate("/home")}>OK</button>
//               </div>
//             </div>
//         )}
//       {/* <button className={style.backButton} onClick={() => navigate(-1)}>Back</button> */}
//     </div>
//   );
// };

// export default ContactUs;

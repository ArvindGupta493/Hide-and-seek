import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "./Resetpassword.module.css";
import { toast } from "react-toastify";
import logo from "../../assets/logo copy.png";
import lock from "../../assets/lock 1.png";
import axios from 'axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("email");
    const otp = localStorage.getItem("otp");

    if (!email || !otp) {
      toast.error("either otp or emaiol is not present");
      // navigate("/forget-password");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/user/update_password', {
        email,
        otp,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      toast.success(response.data.message);
      localStorage.removeItem("email");
      localStorage.removeItem("otp");
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.success("User Already Logged In");
      navigate("/home");
    }
  }, [navigate]);

  return (
    <div className={style.Verification}>
      <div className={style.backButton}>
        <Link to="/login">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
      </div>
      <div className={style.NavbarLogos}>
        <img src={logo} alt="Logo" />
      </div>

      <div className={style.NavbarLogo}>
        <img src={lock} alt="Lock" />
      </div>

      <div className={style.headings}>
        <h1>Reset Password</h1>
      </div>

      <form onSubmit={handlePasswordReset} className={style.VerificationForm}>
        <div className={style.passwordContainer}>
          <input
            type={"text" }
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="New Password"
            required
          />
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />
          <span className={style.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
            <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
          </span>
        </div>
        
        <button className={style.continue} type="submit">Continue</button>

        {/* <div className={style.resetbutton}>      
          <button type="submit">Continue</button>
        </div> */}
      </form>
    </div>
  );
};

export default ResetPassword;





















// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import style from "./Resetpassword.module.css";
// import { toast } from "react-toastify";
// import logo from "../../assets/logo copy.png";
// import lock from "../../assets/lock 1.png";

// const ResetPassword = () => {
//   const navigate = useNavigate();

//   const [loginForm, setLoginForm] = useState({
//     email: "",
//     password: "",
//   });

//   const handleLogin = (e) => {
//     const { name, value } = e.target;
//     setLoginForm({ ...loginForm, [name]: value });
//   };

//   const [showPassword, setShowPassword] = useState(false);


//   const handleVerificationSubmit = (e) => {
//       e.preventDefault();
//       toast.success("Successfully reset Password");
//       navigate("/home");
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       toast.success("User Already Logged In");
//     }
//   }, [navigate]);

//   return (
//     <div className={style.Verification}>
//       <div className={style.backButton}>
//         <Link to="/login">
//           <i className="fa-solid fa-arrow-left"></i>
//         </Link>
//       </div>
//       <div className={style.NavbarLogos}>
//         <img src={logo} alt="Logo" />
//       </div>
      
//       <div className={style.NavbarLogo}>
//         <img src={lock} alt="Lock" />
//       </div>
      
//       <div className={style.heading}>
//         <h1>Reset Password</h1>
     
//       </div>

//       <form onSubmit={handleVerificationSubmit} className={style.VerificationForm}>
//             <div className={style.passwordContainer}>
//                 <input
//                   type={"password"}
//                   name="password"
//                   value={loginForm.newpassword}
//                   onChange={handleLogin}
//                   placeholder="New Password"
//                   required
//                 />
//                 <div className={style.passwordContainer}>
//                     <input
//                         type={showPassword ? "text" : "password"}
//                         name="password"
//                         value={loginForm.Confirmpassword}
//                         onChange={handleLogin}
//                         placeholder="Confirm Password"
//                         required
//                     />
//                     <span  className={style.eyeIcon}  onClick={() => setShowPassword(!showPassword)} >
//                         <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`} ></i>
//                     </span>
//                 </div>
//             </div>
            
//             <button type="submit">Continue</button>
//       </form>
//     </div>
//   );
// };

// export default ResetPassword;

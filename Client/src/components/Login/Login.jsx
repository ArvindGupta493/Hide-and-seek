import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "./Login.module.css";
import axios from "axios";
import { toast } from "react-toastify";
import logo from "../../assets/logo copy.png";

const ADMIN_EMAIL = "mohit@gda.com"; 

const Login = () => {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };
 
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const isAdmin = loginForm.email === ADMIN_EMAIL;
    const loginApi = isAdmin
      ? "http://localhost:5000/api/admin/login"
      : "http://localhost:5000/api/user/login";
  
    try {
      const response = await axios.post(loginApi, loginForm);
  
      console.log("Full Response Data:", response); // Debugging
      console.log("Received Token:", response.data.ResponseData?.token); // Updated this line
  
      // 🔹 Fix: Extract token from ResponseData
      const token = response.data.ResponseData?.token;
      const username = response.data.ResponseData?.username; 
      const userId = response.data.ResponseData?.userId; 
      const useremail = response.data.ResponseData?.email;

      if (!token) {
        throw new Error("Token not found in response!");
      }
  
      localStorage.setItem("token", token);
      localStorage.setItem("role", isAdmin ? "admin" : "user");
      localStorage.setItem("username", username); 
      localStorage.setItem("userId", userId);   
      localStorage.setItem("email", useremail);
      
      toast.success(response.data.ResponseMessage);
      navigate(isAdmin ? "/adminDashboard" : "/home");
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.ResponseMessage || "Login failed");
    }
  };
    
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.success("User Already Logged In");
    }
  }, []);

  return (
    <div className={style.login}>
      <div className={style.NavbarLogos}>
        <img src={logo} alt="Logo" />
      </div>
      <div className={style.heading}>
        <h1>Login</h1>
      </div>
      <form onSubmit={handleLoginSubmit} className={style.loginForm}>
        <div className={style.loginInput}>
          <input
            type="email"
            id="email"
            value={loginForm.email}
            onChange={handleLogin}
            name="email"
            placeholder="Username or Email"
            required
          />
        </div>
        <div className={style.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={loginForm.password}
            onChange={handleLogin}
            placeholder="Password"
            required
          />
          <span className={style.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
            <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
          </span>
        </div>

        <button className={style.loginbutton} type="submit">Login</button>

        <div className={style.forgotPassword}>
          <p>
            <Link to={"/forget-password"}>Forgot Password?</Link>
          </p>
        </div>
      </form>

      <div className={style.already}>
        <p>______________OR _____________</p>
      </div>

      <div className={style.already}>
        <p>
          Don’t have an account? <Link to={"/register"}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;


// check why th login is not working properly and generate the proper token with the user data when the user logs in it Received Token: undefined why is that happening in frontend  but not in backend 




















































// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import style from "./Login.module.css";
// import axios from 'axios';
// import { toast } from "react-toastify";
// import logo from "../../assets/logo copy.png";

// const ADMIN_EMAILS = ["mohit@gda.com", "admin@example.com"]; // Add all admin emails

// const Login = () => {
//   const navigate = useNavigate();
//   const [loginForm, setLoginForm] = useState({
//     email: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = (e) => {
//     const { name, value } = e.target;
//     setLoginForm({ ...loginForm, [name]: value });
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();

//     const isAdminUser = ADMIN_EMAILS.includes(loginForm.email);
//     const loginApi = isAdminUser
//       ? "http://localhost:5000/api/admin/login"
//       : "http://localhost:5000/api/user/login";

//     try {
//       const response = await axios.post(loginApi, loginForm);
//       const { token, user } = response.data.ResponseData;

//       localStorage.setItem("token", token);
//       localStorage.setItem("userId", user._id);
//       localStorage.setItem("role", user.role);

//       toast.success(response.data.ResponseMessage);

//       if (user.role === "admin") {
//         navigate('/adminDashboard');
//       } else {
//         navigate('/home');
//       }

//     } catch (error) {
//       toast.error(error.response?.data?.ResponseMessage || 'Login failed');
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       toast.success("User Already Logged In");
//       const role = localStorage.getItem("role");
//       navigate(role === "admin" ? "/admin" : "/home");
//     }
//   }, [navigate]);

//   return (
//     <div className={style.login}>
//       <div className={style.NavbarLogos}>
//         <img src={logo} alt="Logo" />
//       </div>
//       <div className={style.heading}>
//         <h1>Login</h1>
//       </div>
//       <form onSubmit={handleLoginSubmit} className={style.loginForm}>
//         <div className={style.loginInput}>
//           <input
//             type="email"
//             id="email"
//             value={loginForm.email}
//             onChange={handleLogin}
//             name="email"
//             placeholder="Username or Email"
//             required
//           />
//         </div>
//         <div className={style.passwordContainer}>
//           <input
//             type={showPassword ? "text" : "password"}
//             name="password"
//             value={loginForm.password}
//             onChange={handleLogin}
//             placeholder="Password"
//             required
//           />
//           <span className={style.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
//             <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
//           </span>
//         </div>

//         <button className={style.loginbutton} type="submit">Login</button>

//         <div className={style.forgotPassword}>
//           <p> <Link to={"/forget-password"}>Forgot Password?</Link> </p>
//         </div>
//       </form>

//       <div className={style.already}>
//         <p>______________OR _____________</p>
//       </div>

//       <div className={style.already}>
//         <p> Don’t have an account? <Link to={"/register"}>Sign Up</Link> </p>
//       </div>
//     </div>
//   );
// };

// export default Login;



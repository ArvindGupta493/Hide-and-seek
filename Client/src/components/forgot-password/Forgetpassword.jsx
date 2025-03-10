import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "./Forgetpassword.module.css";
import { toast } from "react-toastify";
import logo from "../../assets/logo copy.png";
import lock from "../../assets/lock 1.png";
import axios from 'axios';


const Forgetpassword = () => {
  const navigate = useNavigate();
  const [forgotForm, setForgotForm] = useState({
    email: "",
  });

  const handleForgot = (e) => {
    const { name, value } = e.target;
    setForgotForm({ ...forgotForm, [name]: value });
  };

  const handleforgetSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/user/otp_generate', forgotForm);
      toast.success(response.data.ResponseMessage);
  
      // Save email in localStorage
      localStorage.setItem("email", forgotForm.email);
  
      navigate("/verification");
    } catch (error) {
      toast.error(error.response?.data?.ResponseMessage || 'OTP generation failed');
    }
  };
  

  // const handleLoginSubmit = async(e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axios.post('http://localhost:5000/api/user/login', loginForm);
  //     toast.success(response.data.ResponseMessage);
  //     navigate('/home'); 
  //   } catch (error) {
  //     toast.error(error.response?.data?.ResponseMessage || 'Registration failed');
  //   }
  // };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.success("User Already Logged In");
    }
  }, [navigate]);

  return (
    <div className={style.forgot}>
         <div className={style.backButton}>
                <Link to="/login">
                  <i className="fa-solid fa-arrow-left"></i>
                </Link>
              </div>
      <div className={style.NavbarLogos}>
        <img src={logo} alt="Logo" />
      </div>
      <img src={lock} alt="Lock" />

      <div className={style.heading}>
        <h1>Forgot Password</h1>
      </div>
      <form onSubmit={handleforgetSubmit} className={style.forgotForm}>
        <div className={style.forgotInput}>
          <input
            type="email"
            id="email"
            value={forgotForm.email}
            onChange={handleForgot}
            name="email"
            placeholder="Email"
            required
          />
        </div>
        {/* <div className={style.Forgetpassword}> */}
            <button className={style.Forgetpassword} type="submit">Continue</button>
        {/* </div> */}
      </form>

      <div className={style.already}>
        <p>______________OR ______________</p>
      </div>

      <div className={style.already}>
        <p> Don’t have an account? <Link to={"/register"}>Sign Up</Link>  </p>
      </div>
    </div>
  );
};

export default Forgetpassword;

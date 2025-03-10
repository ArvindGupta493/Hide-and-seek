import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "./verification.module.css";
import { toast } from "react-toastify";
import logo from "../../assets/logo copy.png";
import lock from "../../assets/lock 1.png";
import axios from 'axios';


const Verification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]); // 4-digit OTP
  const inputRefs = useRef([]);

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) { // Only allow numbers
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus to next input
      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // const handleVerificationSubmit = (e) => {
  //   e.preventDefault();
  //   const enteredOtp = otp.join("");
  //   if (enteredOtp.length === 4) {
  //     toast.success("OTP Verified!");
  //     navigate("/reset-password");
  //   } else {
  //     toast.error("Please enter a valid 4-digit OTP.");
  //   }
  // };
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    const email = localStorage.getItem("email"); 
  
    if (!email) {
      toast.error("Email is missing. Please start the process again.");
      return;
    }
  
    if (enteredOtp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP.");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/user/otp_verify', { email, otp: enteredOtp });
      toast.success(response.data.message); 
      localStorage.setItem("otp", enteredOtp);       // Store the verified OTP 
  
      navigate("/reset-password");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.success("User Already Logged In");
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
      
      <div className={style.heading}>
        <h1>Verification</h1>
     
      </div>

      <form onSubmit={handleVerificationSubmit} className={style.VerificationForm}>
      <p>Enter OTP</p>
        <div className={style.OtpInput}>
      
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className={style.otpBox}
              required
            />
          ))}
        </div>
        {/* <div className={style.Verificationbutton}>   */}
          <button className={style.Verificationbutton} type="submit">Verify OTP</button>
        {/* </div> */}
      </form>
    </div>
  );
};

export default Verification;

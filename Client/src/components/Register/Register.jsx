import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import style from './Register.module.css';
import logo from '../../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const [RegisterForm, setRegisterForm] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...RegisterForm, [name]: value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/user/register', RegisterForm);
      toast.success(response.data.ResponseMessage);
      navigate('/login'); 
    } catch (error) {
      toast.error(error.response?.data?.ResponseMessage || 'Registration failed');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      toast.success('User Already Logged In');
    }
  }, [navigate]);

  return (
    <div className={style.registerContainer}>
      {/* Back Button */}
      <div className={style.backButton}>
        <Link to="/login">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
      </div>

      {/* Logo Section */}
      <div className={style.logoContainer}>
        <img src={logo} alt="Logo" />
      </div>

      {/* Sign Up Heading */}
      <h1 className={style.heading}>Sign Up</h1>

      {/* Sign Up Form */}
      <form onSubmit={handleRegisterSubmit} className={style.registerForm}>
        <input
          type="email"
          name="email"
          value={RegisterForm.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />

        <input
          type="text"
          name="name"
          value={RegisterForm.name}
          onChange={handleInputChange}
          placeholder="Full Name"
          required
        />

        <input
          type="text"
          name="username"
          value={RegisterForm.username}
          onChange={handleInputChange}
          placeholder="Username"
          required
        />

        {/* Password Field with Eye Icon */}
        <div className={style.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={RegisterForm.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
          <span
            className={style.eyeIcon}
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={`fa-solid ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
          </span>
        </div>

        {/* Sign Up Button */}
        {/* <div className={style.signUpButton}> */}
          <button className={style.signUpButton} type="submit" > Sign Up </button>
        {/* </div> */}
      
      </form>
    </div>
  );
};

export default Register;


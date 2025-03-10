import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import style from "./hamberger.module.css";
import axios from 'axios';


const Hamberger = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTermsAndConditonsConfimation, setTermsAndConditonsConfimation] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.success("User Already Logged In");
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  }; 

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // const handleLogoutClick = () => {
  //   setShowLogoutConfirm(true);
  // };


  // const confirmLogout = () => {
  //   localStorage.removeItem("token"); 
  //   toast.success("Logged out successfully!");
  //   navigate("/login"); 
  //   setShowLogoutConfirm(false);
  //   setIsOpen(false);
  // };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };
  
  const confirmLogout = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      // toast.error("No token found. Please log in again.");
      toast.success("Logged out successfully!");
      navigate("/login");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/logout",
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );
    
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");

      // localStorage.removeItem("token"); 
      sessionStorage.removeItem("token");
      
      toast.success(response.data.message || "Logged out successfully!");
      
      navigate("/login");
      setIsOpen(false);
      setShowLogoutConfirm(false);
  
    } catch (error) {
      console.error("Logout Error:", error.response);
      toast.error(error.response?.data?.ResponseMessage || "Logout failed");
    }
  };
  

  const handleTermsAndConditonsClick = () => {
    setTermsAndConditonsConfimation(true);
  }
  
  return (
    <div className={style.home}>
      <div className={style.menuIcon} onClick={toggleMenu}>
        ☰
      </div>

      {isOpen && (
        <div className={style.menuDropdown}>
          <ul>
            <li onClick={() => handleNavigation("/my-account")}>My Account</li>
            <li onClick={() => handleNavigation("/game-history")}>Game History</li>
            <li onClick={() => handleNavigation("/about-us")}>About Us</li>
            <li onClick={handleTermsAndConditonsClick}>Terms & Conditions</li>
            <li onClick={() => handleNavigation("/privacy-policy")}>Privacy Policy</li>
            <li onClick={() => handleNavigation("/contact-us")}>Contact Us</li>
            <li onClick={handleLogoutClick}>Logout</li>
          </ul>
        </div>
      )}

      {/* Logout Popup */}
      {showLogoutConfirm && (
        <div className={style.logoutPopup}>
          <div className={style.logoutBox}>
            <p>Are you sure you want to logout?</p>
            <div className={style.buttonGroup}>
              <button className={style.yesButton} onClick={confirmLogout}>Yes</button>
              <button className={style.noButton} onClick={() => setShowLogoutConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      { /*Terms and condition Popup */}
      {showTermsAndConditonsConfimation && (
        <div className={style.termsPopup}>
            <div className={style.termsBox}>

              <h1>User Agreement</h1>
              <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repellendus ex sed nobis velit tempore voluptatum laboriosam aspernatur necessitatibus vel consequuntur ab accusamus voluptate quis amet, id error earum laborum quas sint ducimus aliquam. Repellat ea totam, tempora, impedit tenetur accusamus dolorem iure eaque possimus distinctio, vel deleniti reiciendis ex rem aliquam dolorum odit alias nemo ullam nobis. Sequi fugit iusto a eius magni sit libero voluptate in recusandae sint. Ratione excepturi quas, blanditiis quibusdam quo, ut repellendus cupiditate rem ullam obcaecati quam eligendi hic, impedit doloribus mollitia? Voluptatum, aperiam corrupti asperiores facilis deleniti quod? Numquam minima beatae earum laborum rerum?</p>

              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, velit ducimus mollitia officiis debitis corporis nisi, distinctio culpa id aspernatur repudiandae recusandae neque corrupti praesentium magnam ex adipisci veritatis tempora?</p>
              
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, velit ducimus mollitia officiis debitis corporis nisi, distinctio culpa id aspernatur repudiandae recusandae neque corrupti praesentium magnam ex adipisci veritatis tempora?</p> 
              
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, velit ducimus mollitia officiis debitis corporis nisi, distinctio culpa id aspernatur repudiandae recusandae neque corrupti praesentium magnam ex adipisci veritatis tempora?</p>

              <div className={style.buttonGroup}>
                <button className={style.yesButton} onClick={() => setTermsAndConditonsConfimation(false)}>I agree</button>
                <button className={style.noButton} onClick={() => setTermsAndConditonsConfimation(false)}>I disagree</button>
              </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Hamberger;

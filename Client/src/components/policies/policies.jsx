import { useNavigate } from "react-router-dom";
import style from "./policies.module.css";
import logo from "../../assets/logo.png";

const Policies = () => {
  const navigate = useNavigate();

  return (
    <div className={style.privacyContainer}>
        <div className={style.logoContainer}>
            <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
        </div>
      <h1> ** Privacy Policy **</h1>
      <p>
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly to us, such as when you register for an account, participate in interactive features, or contact us for support.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use your information to improve our services, communicate with you, and ensure security. Your data is never shared without consent.
      </p>

      <h2>3. Security Measures</h2>
      <p>
        We implement robust security measures to protect your data from unauthorized access, alteration, or destruction.
      </p>

      <h2>4. Your Rights</h2>
      <p>
        You have the right to access, update, or delete your personal information. If you have any concerns, feel free to contact us.
      </p>

      <button className={style.backButton} onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
};

export default Policies;

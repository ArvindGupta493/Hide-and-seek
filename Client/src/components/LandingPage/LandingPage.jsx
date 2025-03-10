// import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './LandingPage.module.css';
import logo from '../../assets/logo.png';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 2000);

        return () => clearTimeout(timer); 
    }, [navigate]);

    return (
        <div className={style.MainContainer}>
            <div className={style.Navbar}>
                <div className={style.leftNav}>
                    <div className={style.NavbarLogo}>
                        <img src={logo} alt="Logo" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

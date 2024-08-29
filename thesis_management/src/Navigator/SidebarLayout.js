// SidebarLayout.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './SidebarLayout.css'; // Custom styles

const SidebarLayout = () => {
    return (
        <div className="sidebar-layout">
            <nav className="sidebar">
                <div className="logo">
                    <img src="https://res.cloudinary.com/du6trravq/image/upload/v1724776000/LogoWeb.png" className="logo-img" alt="Logo"/>
                </div>
                <div className="text">
                        <h1>QUẢN LÍ KHÓA LUẬN TỐT NGHIỆP</h1>
                </div>
                <ul className="sidebar-options">
                    <li>
                        <NavLink to="/home" className="sidebar-link" activeClassName="active-link">
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/contactlist" className="sidebar-link" activeClassName="active-link">
                            Contact List
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/menu" className="sidebar-link" activeClassName="active-link">
                            Menu
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/profile" className="sidebar-link" activeClassName="active-link">
                            Profile
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <div className="content">
                <Outlet /> {/* This will render the matched page */}
            </div>
        </div>
    );
};

export default SidebarLayout;

// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Users/login';
import SidebarLayout from './Navigator/SidebarLayout';
import ContactList from './Chat/ContactList';
import Menu from './Menu/Menu';
import Profile from './Users/Profile';
import Home from './home/Home';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<SidebarLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/contactlist" element={<ContactList />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/profile" element={<Profile/>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;

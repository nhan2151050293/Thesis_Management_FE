// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Users/login';
import SidebarLayout from './Navigator/SidebarLayout';
import ContactList from './Chat/ContactList';
import Menu from './Menu/Menu';
import Profile from './Users/Profile';
import Home from './home/Home';
import Study from './Function/Study/Study';
import Students from './Function/Students/Students';
import Lecturer from './Function/Lecturer/Lecturer';
import Theses from './Function/Theses/Theses';
import Score from './Function/Score/Score';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<SidebarLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/contactlist" element={<ContactList />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/study" element={<Study />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/lecturer" element={<Lecturer />} />
                    <Route path="/theses" element={<Theses />} />
                    <Route path="/score" element={<Score />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;

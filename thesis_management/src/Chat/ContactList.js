import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyUserContext } from '../configs/Contexts';
import './ContactListStyle.css';
import APIs, { endpoints } from '../configs/APIs';

const ContactList = () => {
    const [theses, setTheses] = useState([]);
    const [filteredTheses, setFilteredTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isStudent, setIsStudent] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const user = useContext(MyUserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTheses = async () => {
            setLoading(true);
            try {
                let response;
                if (user.role === 'student') {
                    if (user.student && user.student.thesis) {
                        response = await APIs.get(endpoints['thesis-by-user-student'](user.student.thesis));
                        if (response.data && !Array.isArray(response.data)) {
                            response.data = [response.data];
                        }
                    } else {
                        setLoading(false);
                        return;
                    }
                } else {
                    response = await APIs.get(endpoints['thesis-by-user-lecturer'](user.id));
                }

                if (response.data && Array.isArray(response.data)) {
                    setTheses(response.data);
                    setFilteredTheses(response.data);
                } else {
                    setTheses([]);
                    setFilteredTheses([]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchTheses();
    }, [user.role, user.id, user.student]);

    useEffect(() => {
        setIsStudent(user.role === 'student');
    }, [user.role]);

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredTheses(theses);
        } else {
            setFilteredTheses(theses.filter((item) => item.code.toLowerCase().includes(searchQuery.toLowerCase())));
        }
    }, [searchQuery, theses]);

    const handleChat = (item) => {
        navigate(`/chat/${item.code}`); // Pass the thesesCode in the URL
    };

    if (loading) {
        return <div className="spinner">Loading...</div>;
    }

    if (theses.length === 0) {
        return (
            <div className="container">
                <div className="TopBackGround">
                    <h2 className="greeting">CHAT</h2>
                </div>
                <p className="noDataText">Chưa có đoạn hội thoại nào.</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="TopBackGround">
                <h2 className="greeting">CHAT</h2>
            </div>
            <input
                type="text"
                className="searchInput"
                placeholder="Tìm kiếm nhóm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="listContainer">
                {filteredTheses.map((item) => (
                    <div key={item.code || item.id} className="chat">
                        <button className="contactItem" onClick={() => handleChat(item)}>
                            Group {item.code}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContactList;

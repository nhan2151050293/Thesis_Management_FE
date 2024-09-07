import React, { useContext } from 'react';
import { MyUserContext } from '../configs/Contexts';
import { useNavigate } from 'react-router-dom';
import './MenuStyle.css';

const Menu = () => {
    const user = useContext(MyUserContext);
    const navigate = useNavigate();

    if (!user) {
        return <div>Loading...</div>;
    }

    const handleNavigation = (route) => {
        navigate(route);
    };

    return (
        <div className="Menu-container">
            <div className="Menu-header">
                <h1 className="Menu-title">MENU</h1>
            </div>
            <div className="Menu-content">
                {user.role === 'ministry' && (
                    <div className="Menu-grid">
                        <button className="Menu-button" onClick={() => handleNavigation('/students')}>
                            Quản lí học sinh
                        </button>
                        <button className="Menu-button" onClick={() => handleNavigation('/lecturer')}>
                            Quản lí giảng viên
                        </button>
                        <button className="Menu-button" onClick={() => handleNavigation('/theses')}>
                            Quản lí khóa luận
                        </button>
                    </div>
                )}
                {user.role === 'lecturer' && (
                    <div className="Menu-grid">
                        <button className="Menu-button" onClick={() => handleNavigation('/score')}>
                            Chấm điểm khóa luận
                        </button>
                        <button className="Menu-button" onClick={() => handleNavigation('/councils')}>
                            Hội đồng tham gia
                        </button>
                        <button className="Menu-button" onClick={() => handleNavigation('/ccc')}>
                            Danh sách khóa luận hướng dẫn
                        </button>
                    </div>
                )}
                {user.role === 'student' && (
                    <div className="Menu-grid">
                        <button className="Menu-button" onClick={() => handleNavigation('/study')}>
                            Thông tin khóa luận
                        </button>
                        <button className="Menu-button" onClick={() => handleNavigation('/study')}>
                            Nộp báo cáo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;

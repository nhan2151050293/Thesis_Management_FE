import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Radio } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import APIs, { endpoints, authApi } from '../../configs/APIs';
import { MyUserContext } from '../../configs/Contexts';
import './ListThesesStyle.css';

const ListTheses = () => {
    const [thesisData, setThesisData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedThesis, setSelectedThesis] = useState(null);
    const [filterType, setFilterType] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const user = useContext(MyUserContext);

    useEffect(() => {
        const fetchThesisData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !user || !user.id) {
                    // Exit early if token or user is not available
                    return;
                }

                let lecturerThesisEndpoint = endpoints['thesis-by-user-lecturer'](user.id);
                let reviewerThesisEndpoint = endpoints['thesis-by-user-reviewer'](user.id);

                const [lecturerThesisResponse, reviewerThesisResponse] = await Promise.all([
                    authApi(token).get(lecturerThesisEndpoint),
                    authApi(token).get(reviewerThesisEndpoint),
                ]);

                const lecturerTheses = lecturerThesisResponse.data.map((thesis) => ({ ...thesis, type: 'Hướng dẫn' }));
                const reviewerTheses = reviewerThesisResponse.data.map((thesis) => ({ ...thesis, type: 'Phản biện' }));

                const combinedTheses = [...lecturerTheses, ...reviewerTheses];

                setThesisData(combinedTheses);
            } catch (error) {
                console.error('Error fetching theses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchThesisData();
    }, [user]);

    const handleViewDetails = (item) => {
        setSelectedThesis(item);
        setModalVisible(true);
    };

    const filteredThesisData = thesisData.filter((item) => {
        if (filterType === 1) return true;
        if (filterType === 2) return item.type === 'Hướng dẫn';
        if (filterType === 3) return item.type === 'Phản biện';
    });

    const { start_date, end_date } = selectedThesis || {};
    const formattedStartDate = start_date ? moment(start_date).format('DD-MM-YYYY') : 'N/A';
    const formattedEndDate = end_date ? moment(end_date).format('DD-MM-YYYY') : 'N/A';

    return (
        <div className="lstcontainer">
            <div className="TopBackGround">
                <h1 className="greeting">DANH SÁCH KHÓA LUẬN</h1>
            </div>
            <div className="filterContainer">
                <Radio.Group onChange={(e) => setFilterType(e.target.value)} value={filterType}>
                    <Radio value={1}>Tất cả</Radio>
                    <Radio value={2}>Hướng dẫn</Radio>
                    <Radio value={3}>Phản biện</Radio>
                </Radio.Group>
            </div>
            {loading ? (
                <div className="loader">
                    <LoadingOutlined style={{ fontSize: 24 }} spin />
                </div>
            ) : (
                <div className="Body">
                    {filteredThesisData.map((item) => (
                        <div key={item.id} className="itemContainer">
                            <span className="itemKind">{item.type}</span>
                            <div className="item">
                                <p className="itemText">Mã: {item.code}</p>
                                <p className="itemText">Tên: {item.name}</p>
                                <p className="itemText">Khoa: {item.major}</p>
                                <p className="itemText">Năm học: {item.school_year}</p>
                            </div>
                            <div className="buttonDetail">
                                <Button type="primary" onClick={() => handleViewDetails(item)} className="button">
                                    Xem Chi Tiết
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
                className="modalContainer"
            >
                {selectedThesis && (
                    <div className="modalContent">
                        <div className="modalInfo">
                            <p className="modalItemTitle">Mã: {selectedThesis.code}</p>
                            <p className="modalItemText">{selectedThesis.name}</p>
                            <p className="modalItemText">Ngày bắt đầu: {formattedStartDate}</p>
                            <p className="modalItemText">Ngày kết thúc: {formattedEndDate}</p>
                            <p className="modalItemText">Tổng điểm: {selectedThesis.total_score}</p>
                            <p className="modalItemText">Kết quả: {selectedThesis.result ? 'Đạt' : 'Chưa đạt'}</p>
                            <p className="modalItemText">Khoa: {selectedThesis.major}</p>
                            <p className="modalItemText">Năm học: {selectedThesis.school_year}</p>
                            <p className="modalItemText">Link báo cáo:</p>
                            <a href={selectedThesis.report_file} target="_blank" rel="noopener noreferrer">
                                {selectedThesis.report_file}
                            </a>
                            <p className="modalItemTitle">Giáo viên hướng dẫn:</p>
                            {selectedThesis.lecturers &&
                                selectedThesis.lecturers.map((lecturer) => (
                                    <div key={lecturer.code}>
                                        <p className="modalItemText">Mã GV: {lecturer.code}</p>
                                        <p className="modalItemText">Họ và Tên: {lecturer.full_name}</p>
                                        <p className="modalItemText">Khoa: {lecturer.faculty}</p>
                                    </div>
                                ))}
                            <p className="modalItemTitle">Sinh viên thực hiện:</p>
                            {selectedThesis.students &&
                                selectedThesis.students.map((student) => (
                                    <div key={student.code}>
                                        <p className="modalItemText">Mã SV: {student.code}</p>
                                        <p className="modalItemText">Họ và Tên: {student.full_name}</p>
                                        <p className="modalItemText">Ngành: {student.major}</p>
                                    </div>
                                ))}
                            {selectedThesis.reviewer && (
                                <>
                                    <p className="modalItemTitle">Giáo viên Phản biện:</p>
                                    <div>
                                        <p className="modalItemText">Mã GV: {selectedThesis.reviewer.code}</p>
                                        <p className="modalItemText">Họ và Tên: {selectedThesis.reviewer.full_name}</p>
                                        <p className="modalItemText">Khoa: {selectedThesis.reviewer.faculty}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <Button type="primary" onClick={() => setModalVisible(false)} className="button">
                            Đóng
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ListTheses;

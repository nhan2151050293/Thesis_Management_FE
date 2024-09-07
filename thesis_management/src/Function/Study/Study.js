import React, { useContext, useEffect, useState } from 'react';
import { Alert, Modal, Button, Spinner } from 'react-bootstrap';
import { MyUserContext } from '../../configs/Contexts';
import { authApi, endpoints } from '../../configs/APIs';
import moment from 'moment';
import './StudyStyle.css';

const Study = () => {
    const [thesisData, setThesisData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [reportFile, setReportFile] = useState('');
    const [selectedThesis, setSelectedThesis] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);
    const user = useContext(MyUserContext);

    useEffect(() => {
        const fetchThesisData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setAlertMessage('Lỗi: Vui lòng đăng nhập');
                    return;
                }
                const response = await authApi(token).get(endpoints['thesis-by-user-student'](user.student.thesis));
                const thesisArray = Array.isArray(response.data) ? response.data : [response.data];

                setThesisData(thesisArray);
            } finally {
                setLoading(false);
            }
        };

        fetchThesisData();
    }, [user.student.thesis]);

    const openModal = (thesis) => {
        setSelectedThesis(thesis);
        setReportFile(thesis.report_file || '');
        setModalVisible(true);
    };

    const submitReport = async () => {
        if (!reportFile) {
            setAlertMessage('Lỗi: Vui lòng nhập đường dẫn');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setAlertMessage('Lỗi: Vui lòng đăng nhập');
                return;
            }

            const formData = {
                report_file: reportFile,
            };

            const response = await authApi(token).patch(
                endpoints['thesis-by-user-student'](user.student.thesis),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            const updatedThesisData = thesisData.map((thesis) =>
                thesis.id === selectedThesis.id ? { ...thesis, report_file: reportFile } : thesis,
            );

            setThesisData(updatedThesisData);
            setModalVisible(false);
            setAlertMessage('Thông báo: Báo cáo đã được nộp');
        } catch (error) {
            setAlertMessage('Lỗi: Không thể nộp báo cáo, vui lòng thử lại');
        }
    };

    const handleOpenLink = (url) => {
        if (url) {
            window.open(url, '_blank');
        } else {
            setAlertMessage('Lỗi: Link của file không tồn tại');
        }
    };

    const renderThesis = (thesis) => (
        <div className="thesis-item" key={thesis.id}>
            <h5>Mã: {thesis.code}</h5>
            <p>Tên: {thesis.name}</p>
            <p>Ngày bắt đầu: {moment(thesis.start_date).format('DD-MM-YYYY')}</p>
            <p>Ngày kết thúc: {moment(thesis.end_date).format('DD-MM-YYYY')}</p>
            <p>Tổng điểm: {thesis.total_score}</p>
            <p>Kết quả: {thesis.result ? 'Đạt' : 'Chưa đạt'}</p>
            <p>Khoa: {thesis.major}</p>
            <p>Năm học: {thesis.school_year}</p>
            <p>Link file báo cáo: </p>
            <button onClick={() => handleOpenLink(thesis.report_file)} className="btn-link">
                {thesis.report_file}
            </button>

            <Button onClick={() => openModal(thesis)}>Nộp Báo Cáo</Button>

            <h5>Sinh viên:</h5>
            {thesis.students.map((student, index) => (
                <div key={index}>
                    <p>Mã SV: {student.code}</p>
                    <p>Họ và Tên: {student.full_name}</p>
                    <p>Ngày sinh: {moment(student.birthday).format('DD-MM-YYYY')}</p>
                    <p>Địa chỉ: {student.address}</p>
                    <p>GPA: {student.gpa}</p>
                    <p>Ngành học: {student.major}</p>
                </div>
            ))}
            <h5>Giáo viên hướng dẫn:</h5>
            {thesis.lecturers.map((lecturer, index) => (
                <div key={index}>
                    <p>Mã GV: {lecturer.code}</p>
                    <p>Họ và Tên: {lecturer.full_name}</p>
                    <p>Khoa: {lecturer.faculty}</p>
                </div>
            ))}
            {thesis.reviewer && (
                <>
                    <h5>Người phản biện:</h5>
                    <div>
                        <p>Mã PB: {thesis.reviewer.code}</p>
                        <p>Họ và Tên: {thesis.reviewer.full_name}</p>
                        <p>Khoa: {thesis.reviewer.faculty}</p>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="study-container">
            <div className="top-background">
                <h1>THÔNG TIN KHÓA LUẬN</h1>
            </div>
            <div className="body">
                {alertMessage && (
                    <Alert variant="warning" onClose={() => setAlertMessage(null)} dismissible>
                        {alertMessage}
                    </Alert>
                )}
                {loading ? (
                    <Spinner animation="border" />
                ) : thesisData.length > 0 ? (
                    thesisData.map(renderThesis)
                ) : (
                    <p>Không có khóa luận nào</p>
                )}
            </div>
            <Modal show={isModalVisible} onHide={() => setModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nộp Báo Cáo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập link drive"
                        value={reportFile}
                        onChange={(e) => setReportFile(e.target.value)}
                    />
                    <p>- Nộp bằng link drive</p>
                    <p>- Sinh viên có thể nộp lại chỉ cần gắn link mới và nhấn nộp thì link mới sẽ tự cập nhật</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={submitReport}>
                        Nộp
                    </Button>
                    <Button variant="secondary" onClick={() => setModalVisible(false)}>
                        Hủy
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Study;

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { MyUserContext } from '../../configs/Contexts';
import { Button, Modal, Form, Spinner, Card, ListGroup } from 'react-bootstrap';
import './Score.css';
import { authApi, endpoints } from '../../configs/APIs';

const Score = () => {
    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedThesis, setSelectedThesis] = useState(null);
    const [criteria, setCriteria] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [scores, setScores] = useState({});
    const [allScoresEntered, setAllScoresEntered] = useState(false);
    const [token, setToken] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const nav = useNavigate();
    const user = useContext(MyUserContext);
    const [editCriteria, setEditCriteria] = useState([]);
    const [editScores, setEditScores] = useState({});
    const [modalVisible2, setModalVisible2] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                if (!storedToken) {
                    alert('Vui lòng đăng nhập');
                    return;
                }
                setToken(storedToken);
            } catch (error) {
                alert('Không thể lấy tài nguyên 1');
            }
        };

        fetchToken();
    }, []);

    useEffect(() => {
        const fetchTheses = async () => {
            try {
                if (!token) {
                    return;
                }

                const councilResponse = await authApi(token).get(endpoints['Council-by-user-lecturer'](user.id));
                const councils = councilResponse.data;

                let allTheses = [];

                for (const council of councils) {
                    const thesesResponse = await authApi(token).get(endpoints['council-theses'](council.council_id));
                    allTheses = [...allTheses, ...thesesResponse.data];
                }

                setTheses(allTheses);
            } catch (error) {
                alert('Không thể tải tài nguyêhn');
            } finally {
                setLoading(false);
            }
        };

        fetchTheses();
    }, [user.id, token]);

    const handleBack = () => {
        nav.navigate('/home');
    };

    const handleViewDetails = async (item) => {
        setSelectedThesis(item);

        try {
            if (!token) {
                alert('Vui lòng đăng nhập');
                return;
            }
            const criteriaResponse = await authApi(token).get(endpoints['theses-criteria'](item.code));
            const fetchedCriteria = criteriaResponse.data;
            setCriteria(fetchedCriteria);
            setModalVisible(true);
        } catch (error) {
            alert('Không thể tải tài nguyên');
        }
    };

    const handleScoreChange = (criteriaId, score) => {
        const criteriaIdInt = parseInt(criteriaId);
        if (isNaN(criteriaIdInt)) {
            return;
        }
        setScores((prevScores) => ({
            ...prevScores,
            [criteriaIdInt]: score,
        }));
    };

    useEffect(() => {
        const checkAllScoresEntered = () => {
            const allEntered = criteria.every(
                (criterion) => scores[criterion.id] !== undefined && scores[criterion.id] !== '',
            );
            setAllScoresEntered(allEntered);
        };

        checkAllScoresEntered();
    }, [scores, criteria]);

    const addScore = async (thesisId, scoresData, token) => {
        try {
            let allSuccess = true;
            let errorMessagesSet = new Set();
            for (const scoreData of scoresData) {
                const formData = new FormData();
                const thesisCriteriaId = scoreData.thesis_criteria;
                formData.append('thesis_criteria', thesisCriteriaId);
                formData.append('score_number', scoreData.score_number);
                try {
                    const res = await authApi(token).post(endpoints['score'], formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    console.log('Form Data Array:', formData);
                } catch (error) {
                    const errorMessage = JSON.stringify(error.response.data).replace(/[{}"]/g, '');
                    if (!errorMessagesSet.has(errorMessage)) {
                        errorMessagesSet.add(errorMessage);
                    }
                    allSuccess = false;
                }
            }
            if (errorMessagesSet.size > 0) {
                alert(Array.from(errorMessagesSet)[0]);
            }
            return allSuccess;
        } catch (error) {
            return false;
        }
    };

    const isScoreValid = (score) => {
        const parsedScore = parseFloat(score);
        return !isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 10;
    };

    const handleSubmitScores = async () => {
        try {
            const formDataArray = criteria.map((criterion) => ({
                thesis_criteria: criterion.id,
                score_number: scores[criterion.id] || 0,
            }));

            const allScoresValid = formDataArray.every((formData) => isScoreValid(formData.score_number));
            console.log(formDataArray.data);

            if (allScoresValid && token) {
                const success = await addScore(selectedThesis.id, formDataArray, token);
                if (success) {
                    // console.log('Tất cả điểm được thêm thành công');
                    setModalVisible(false);
                }
            } else {
                console.error('Vui lòng nhập điểm từ 0 đến 10.');
            }
        } catch (error) {
            console.error('Lỗi khi gửi điểm:', error);
        }
    };

    const handleEditDetails = async (item) => {
        setSelectedThesis(item);
        try {
            if (!token) {
                alert('Vui lòng đăng nhập');
                return;
            }
            const criteriaResponse = await authApi(token).get(endpoints['these_lecturer-scores'](item.code));
            const fetchedCriteria = criteriaResponse.data;
            setEditCriteria(fetchedCriteria);
            setEditModalVisible(true);
        } catch (error) {
            alert('Không thể tải tài nguyên');
        }
    };

    const handleEditScoreChange = (criteriaId, score) => {
        const criteriaIdInt = parseInt(criteriaId);
        if (isNaN(criteriaIdInt)) {
            return;
        }
        setEditScores((prevScores) => ({
            ...prevScores,
            [criteriaIdInt]: score,
        }));
    };

    const editScore = async (scoresData, token) => {
        try {
            let allSuccess = true;
            let errorMessagesSet = new Set();

            for (const scoreData of scoresData) {
                const formData = new FormData();
                const scoreId = scoreData.id;
                formData.append('score_number', scoreData.score_number);

                try {
                    const res = await authApi(token).patch(endpoints['score_id'](scoreId), formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                        },
                    });
                } catch (error) {
                    const errorMessage = JSON.stringify(error.response.data).replace(/[{}"]/g, '');
                    if (!errorMessagesSet.has(errorMessage)) {
                        errorMessagesSet.add(errorMessage);
                    }
                    allSuccess = false;
                }
            }

            if (errorMessagesSet.size > 0) {
                alert(Array.from(errorMessagesSet)[0]);
            }

            return allSuccess;
        } catch (error) {
            return false;
        }
    };

    const handleSubmitEditScores = async () => {
        try {
            const formDataArray = editCriteria
                .filter((item) => editScores[item.id] !== undefined && editScores[item.id] !== item.score_number)
                .map((item) => ({
                    id: item.id,
                    score_number: editScores[item.id],
                }));

            if (formDataArray.length === 0) {
                alert('Không có điểm nào được thay đổi.');
                return;
            }

            if (token) {
                const success = await editScore(formDataArray, token);
                if (success) {
                    alert('Điểm sửa thành công.');
                    setEditModalVisible(false);
                }
            }
        } catch (error) {
            alert('Vui lòng thử lại');
        }
    };

    const handleViewDetails2 = (item) => {
        setSelectedThesis(item);
        setModalVisible2(true);
    };

    const renderItem = (item) => (
        <Card>
            <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>Ngày bắt đầu: {moment(item.start_date).format('DD-MM-YYYY')}</Card.Text>
                <Card.Text>Ngày kết thúc: {moment(item.end_date).format('DD-MM-YYYY')}</Card.Text>
                <Card.Text>Khoa: {item.major}</Card.Text>
                <Button variant="primary" onClick={() => handleViewDetails2(item)}>
                    Xem chi tiết
                </Button>
                <Button variant="secondary" onClick={() => handleViewDetails(item)}>
                    Chấm điểm
                </Button>
                <Button variant="secondary" onClick={() => handleEditDetails(item)}>
                    Chỉnh sửa điểm
                </Button>
            </Card.Body>
        </Card>
    );

    const { start_date, end_date } = selectedThesis || {};
    const formattedStartDate = start_date ? moment(start_date).format('DD-MM-YYYY') : 'N/A';
    const formattedEndDate = end_date ? moment(end_date).format('DD-MM-YYYY') : 'N/A';

    return (
        <div>
            <div className="header">
                <Button onClick={handleBack} variant="outline-primary">
                    Quay lại
                </Button>
                <h1>Quản lý điểm</h1>
            </div>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <ListGroup>
                    {theses.map((item) => (
                        <ListGroup.Item key={item.id}>{renderItem(item)}</ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Chấm điểm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modalContent">
                        <h2 className="modalTitle">Tiêu chí của khóa luận</h2>
                        <div className="criteriaList">
                            {criteria.map((item) => (
                                <div key={item.id} className="criteriaItem">
                                    <p className="modalItemText">{item.criteria.name}</p>
                                    <p className="modalItemText2">{item.criteria.evaluation_method}</p>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        placeholder="Nhập điểm 1-10"
                                        className="inputScore"
                                        onChange={(e) => handleScoreChange(item.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleSubmitScores} disabled={!allScoresEntered}>
                        Xác nhận điểm
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={editModalVisible} onHide={() => setEditModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa điểm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modalBody">
                        {editCriteria.map((item) => (
                            <div key={item.id} className="criteriaItem">
                                <p className="modalItemText">{item.criteria_name}</p>
                                <p className="modalItemText2">{item.evaluation_method}</p>
                                <p className="modalItemText2">Điểm: {item.score_number}</p>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="Nhập điểm mới: "
                                    className="inputScore"
                                    onChange={(e) => handleEditScoreChange(item.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditModalVisible(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleSubmitEditScores}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={modalVisible2} onHide={() => setModalVisible2(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết khóa luận</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modalBody">
                        <div className="modalInfo">
                            {selectedThesis && (
                                <div className="modalItem">
                                    <p className="modalItemText">Mã: {selectedThesis.code}</p>
                                    <p className="modalItemText">{selectedThesis.name}</p>
                                    <p className="modalItemText">Ngày bắt đầu: {formattedStartDate}</p>
                                    <p className="modalItemText">Ngày kết thúc: {formattedEndDate}</p>
                                    <p className="modalItemText">Tổng điểm: {selectedThesis.total_score}</p>
                                    <p className="modalItemText">
                                        Kết quả: {selectedThesis.result ? 'Đạt' : 'Chưa đạt'}
                                    </p>
                                    <p className="modalItemText">Khoa: {selectedThesis.major}</p>
                                    <p className="modalItemText">Năm học: {selectedThesis.school_year}</p>
                                    <p className="modalItemText">Link báo cáo: </p>
                                    <a
                                        href="#"
                                        // onClick={() => handleOpenLink(selectedThesis.reportFile)}
                                        className="itemLink"
                                    >
                                        {selectedThesis.reportFile}
                                    </a>
                                    <p className="modalItemText bold-text">Giáo viên hướng dẫn:</p>
                                    {selectedThesis.lecturers &&
                                        selectedThesis.lecturers.map((lecturer) => (
                                            <div key={lecturer.code} className="modalItem">
                                                <p className="modalItemText">Mã GV: {lecturer.code}</p>
                                                <p className="modalItemText">Họ và Tên: {lecturer.full_name}</p>
                                                <p className="modalItemText">Khoa: {lecturer.faculty}</p>
                                            </div>
                                        ))}
                                    <p className="modalItemText bold-text">Sinh viên thực hiện:</p>
                                    {selectedThesis.students &&
                                        selectedThesis.students.map((student) => (
                                            <div key={student.code} className="modalItem">
                                                <p className="modalItemText">Mã SV: {student.code}</p>
                                                <p className="modalItemText">Họ và Tên: {student.full_name}</p>
                                                <p className="modalItemText">Ngành: {student.major}</p>
                                            </div>
                                        ))}
                                    {selectedThesis.reviewer && (
                                        <>
                                            <p className="modalItemText bold-text">Giáo viên Phản biện:</p>
                                            <div className="modalItem">
                                                <p className="modalItemText">Mã GV: {selectedThesis.reviewer.code}</p>
                                                <p className="modalItemText">
                                                    Họ và Tên: {selectedThesis.reviewer.full_name}
                                                </p>
                                                <p className="modalItemText">Khoa: {selectedThesis.reviewer.faculty}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalVisible2(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Score;

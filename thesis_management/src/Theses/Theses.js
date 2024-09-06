import React, { useContext, useState, useEffect } from 'react';
import { Alert, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MyUserContext } from '../configs/Contexts';
import APIs, { authApi, endpoints } from '../configs/APIs';
import moment from 'moment';
import './Theses.css';
import { faL } from '@fortawesome/free-solid-svg-icons/faL';

const Theses = () => {
    const user = useContext(MyUserContext) || {};
    const navigate = useNavigate();
    const [councils, setCouncils] = useState([]);
    const [majors, setMajors] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [students, setStudents] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    const [newThesis, setNewThesis] = useState([]);
    const [filteredThese, setFilteredThese] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [thesisData, setThesisData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [thesisToDelete, setThesisToDelete] = useState(null);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [selectedCouncil, setSelectedCouncil] = useState('');
    const [selectedLecturer, setSelectedLecturer] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

    const [showCouncilList, setShowCouncilList] = useState(false);
    const [showLecturerList, setShowLecturerList] = useState(false);
    const [showMajorList, setShowMajorList] = useState(false);
    const [showSchoolYearList, setShowSchoolYearList] = useState(false);
    const [showStudentList, setShowStudentList] = useState(false);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = thesisData.filter(
            (thesis) =>
                thesis.code.toLowerCase().includes(query) ||
                thesis.name.toLowerCase().includes(query) ||
                thesis.council.toLowerCase().includes(query) ||
                thesis.major.toLowerCase().includes(query),
        );
        setFilteredThese(filtered);
    };

    const loadThese = async () => {
        setLoading(true);
        try {
            const response = await APIs.get(endpoints['theses']);
            setThesisData(response.data.results);
            setFilteredThese(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách sinh viên. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadCouncils = async () => {
        setLoading(true);
        try {
            const response = await APIs.get(endpoints['councils']);
            setCouncils(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách hội đồng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadLecturers = async () => {
        setLoading(true);
        try {
            const response = await APIs.get(endpoints['lecturers']);
            setLecturers(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách hội đồng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadMajors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const api = authApi(token);
            const response = await api.get(endpoints['majors']);
            setMajors(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách chuyên nghành. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadSchoolYears = async () => {
        setLoading(true);
        try {
            const response = await APIs.get(endpoints['school_years']);
            setSchoolYears(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách niên khóa. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const api = authApi(token);
            const response = await api.get(endpoints['students']);
            setStudents(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách sinh viên. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
        loadThese();
        loadCouncils();
        loadLecturers();
        loadMajors();
        loadSchoolYears();
    }, []);

    const handleShowAddModal = () => {
        setNewThesis({
            code: '',
            name: '',
            start_date: 'Chọn ngày bắt đầu',
            end_date: 'Chọn ngày kết thúc',
            reportFile: '',
            total_score: 0.0,
            result: '',
            council: 'Chọn hội đồng',
            major: 'Chọn chuyên nghành',
            school_year: 'Chọn niên khóa',
            student: 'Chọn sinh viên',
        });
        setShowAddModal(true);
    };

    const handleCouncilInputClick = () => {
        setShowCouncilList(!showCouncilList);
    };

    const handleLecturerInputClick = () => {
        setShowLecturerList(!showLecturerList);
    };

    const handleStudentInputClick = () => {
        setShowStudentList(!showStudentList);
    };

    const handleMajorInputClick = () => {
        setShowMajorList(!showMajorList);
    };

    const handleSchoolYearInputClick = () => {
        setShowSchoolYearList(!showSchoolYearList);
    };

    // Select a major from the list
    const handleCouncilSelect = (council_id, council_name) => {
        setNewThesis({ ...newThesis, council: council_id });
        setSelectedCouncil(council_name);
        setShowCouncilList(false);
    };

    const handleLecturerSelect = (lecturer_user, lecturer_full_name) => {
        setNewThesis({ ...newThesis, lecturer: lecturer_user });
        setSelectedLecturer(lecturer_full_name);
        setShowLecturerList(false);
    };

    const handleStudentSelect = (student_user, student_full_name) => {
        setNewThesis({ ...newThesis, student: student_user });
        setSelectedStudent(student_full_name);
        setShowStudentList(false);
    };

    const handleMajorSelect = (major_code, major_name) => {
        setNewThesis({ ...newThesis, major: major_code });
        setSelectedMajor(major_name);
        setShowMajorList(false);
    };

    const handleSchoolYearSelect = (school_year_id, school_year_name) => {
        setNewThesis({ ...newThesis, school_year: school_year_id });
        setSelectedSchoolYear(school_year_name);
        setShowSchoolYearList(false);
    };

    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setShowAddModal(false);
        setSelectedStudent(null);
        setShowCouncilList(false);
        setShowLecturerList(false);
        setShowMajorList(false);
        setShowSchoolYearList(false);
    };

    const handleAddThesis = async () => {
        console.log(newThesis);
        setLoading(true);
        try {
            // Make sure all required fields are filled
            if (
                !newThesis.code ||
                !newThesis.name ||
                !newThesis.start_date ||
                !newThesis.end_date ||
                !newThesis.council ||
                !newThesis.major ||
                !newThesis.school_year ||
                !newThesis.student
            ) {
                setError('Vui lòng điền đầy đủ thông tin.');
                return;
            }
            const res = await APIs.post(endpoints['theses'], newThesis, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setThesisData([...thesisData, res.data]);
            setFilteredThese([...filteredThese, res.data]);
            setShowAddModal(false);
            setSelectedCouncil('');
            setSelectedLecturer('');
            setSelectedStudent('');
            setSelectedMajor('');
            setSelectedSchoolYear('');
            alert('Thêm khóa luận thành công!');
        } catch (error) {
            console.error(error);
            setError('Không thể thêm khóa luận. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
            handleCloseModal();
        }
    };

    const handleDelete = (thesis_code) => {
        setThesisToDelete(thesis_code);
        setShowDeleteModal(true);
    };

    const confirmDeleteThesis = async () => {
        if (thesisToDelete) {
            try {
                await APIs.delete(endpoints['delete-thesis'](thesisToDelete));
                loadThese();
                alert('Khóa luận đã được xóa thành công!');
            } catch (error) {
                console.error(error);
                alert('Không thể xóa khóa luận. Vui lòng thử lại sau.');
            } finally {
                setShowDeleteModal(false);
                setThesisToDelete(null);
            }
        }
    };

    return (
        <div>
            <div className="student-header">
                <h1 className="student-title">Quản lý khóa luận</h1>
            </div>

            {loading && <p>Đang tải...</p>}
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="students-container">
                <div className="search-container">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm khóa luận..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <button type="button" className="btn btn-primary add-btn" onClick={handleShowAddModal}>
                        Thêm khóa luận
                    </button>
                </div>
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Mã khóa luận</th>
                            <th>Tên khóa luận</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>File báo cáo</th>
                            <th>Tổng điểm</th>
                            <th>Kết quả</th>
                            <th>Hội đồng</th>
                            <th>Giảng viên hướng dẫn</th>
                            <th>Chuyên nghành</th>
                            <th>Niên khóa</th>
                            <th>Cập nhật</th>
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredThese.map((thesis, index) => (
                            <tr key={index}>
                                <td>{thesis.code}</td>
                                <td>{thesis.name}</td>
                                <td>{moment(thesis.start_date).format('DD/MM/YYYY')}</td>
                                <td>{moment(thesis.end_date).format('DD/MM/YYYY')}</td>
                                <td>
                                    {thesis.report_file ? (
                                        <a href={thesis.report_file} target="_blank" rel="noopener noreferrer">
                                            {thesis.report_file}
                                        </a>
                                    ) : (
                                        'Chưa có'
                                    )}
                                </td>
                                <td>{thesis.total_score}</td>
                                <td>{thesis.result === false ? 'Chưa đạt' : 'Đạt'}</td>
                                <td>{thesis.council}</td>
                                <td>
                                    {thesis.lecturers.length > 0
                                        ? thesis.lecturers.map((lecturer, i) => <div key={i}>{lecturer.full_name}</div>)
                                        : 'Chưa có giảng viên'}
                                </td>
                                <td>{thesis.major}</td>
                                <td>{thesis.school_year}</td>
                                <td>
                                    <button type="button" className="btn btn-primary" onClick={() => {}}>
                                        Cập nhật
                                    </button>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(thesis.code)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa khóa luận này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteThesis}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal thêm sinh viên */}
            <Modal show={showAddModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm khóa luận</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCode">
                            <Form.Label>Mã khóa luận</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập mã khóa luận"
                                value={newThesis.code}
                                onChange={(e) => setNewThesis({ ...newThesis, code: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formName">
                            <Form.Label>Tên khóa luận</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên khóa luận"
                                value={newThesis.name}
                                onChange={(e) => setNewThesis({ ...newThesis, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formStartDay">
                            <Form.Label>Ngày bắt đầu</Form.Label>
                            <Form.Control
                                type="date"
                                value={newThesis.start_date}
                                onChange={(e) => setNewThesis({ ...newThesis, start_date: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEndDay">
                            <Form.Label>Ngày kết thúc</Form.Label>
                            <Form.Control
                                type="date"
                                value={newThesis.end_date}
                                onChange={(e) => setNewThesis({ ...newThesis, end_date: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCouncil">
                            <Form.Label>Hội đồng</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn hội đồng"
                                value={selectedCouncil}
                                onClick={handleCouncilInputClick}
                                readOnly
                            />
                            {showCouncilList && (
                                <div className="major-list">
                                    {councils.map((council) => (
                                        <div
                                            key={council.id}
                                            className="major-item"
                                            onClick={() => handleCouncilSelect(council.id, council.name)}
                                        >
                                            {council.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group controlId="formLecturer">
                            <Form.Label>Giảng viên hướng dẫn</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn giảng viên hướng dẫn"
                                value={selectedLecturer}
                                onClick={handleLecturerInputClick}
                                readOnly
                            />
                            {showLecturerList && (
                                <div className="major-list">
                                    {lecturers.map((lecturer) => (
                                        <div
                                            key={lecturer.user}
                                            className="major-item"
                                            onClick={() => handleLecturerSelect(lecturer.user, lecturer.full_name)}
                                        >
                                            {lecturer.full_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group controlId="formLecturer">
                            <Form.Label>Sinh viên thực hiện</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn sinh viên thực hiện"
                                value={selectedStudent}
                                onClick={handleStudentInputClick}
                                readOnly
                            />
                            {showStudentList && (
                                <div className="major-list">
                                    {students.map((student) => (
                                        <div
                                            key={student.user}
                                            className="major-item"
                                            onClick={() => handleStudentSelect(student.user, student.full_name)}
                                        >
                                            {student.full_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group controlId="formMajor">
                            <Form.Label>Chuyên Ngành</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn chuyên nghành"
                                value={selectedMajor}
                                onClick={handleMajorInputClick}
                                readOnly
                            />
                            {showMajorList && (
                                <div className="major-list">
                                    {majors.map((major) => (
                                        <div
                                            key={major.code}
                                            className="major-item"
                                            onClick={() => handleMajorSelect(major.code, major.name)}
                                        >
                                            {major.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group controlId="formSchoolYear">
                            <Form.Label>Niên khóa</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn niên khóa"
                                value={selectedSchoolYear}
                                onClick={handleSchoolYearInputClick}
                                readOnly
                            />
                            {showSchoolYearList && (
                                <div className="major-list">
                                    {schoolYears.map((school_year) => (
                                        <div
                                            key={school_year.id}
                                            className="major-item"
                                            onClick={() => handleSchoolYearSelect(school_year.id, school_year.name)}
                                        >
                                            {school_year.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleAddThesis}>
                        Thêm khóa luận
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Theses;

import React, { useContext, useState, useEffect } from 'react';
import { Alert, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MyUserContext } from '../../configs/Contexts';
import APIs, { authApi, endpoints } from '../../configs/APIs';
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

    const [selectedThesis, setSelectedThesis] = useState(null);

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
            console.log(response.data.results);
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
            students: [], // Thay đổi từ 'student' thành mảng 'students'
            lecturers: [], // Thay đổi từ 'lecturer' thành mảng 'lecturers'
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

    // const handleLecturerSelect = (lecturer_user, lecturer_full_name) => {
    //     setNewThesis({ ...newThesis, lecturer: lecturer_user });
    //     setSelectedLecturer(lecturer_full_name);
    //     setShowLecturerList(false);
    // };

    // const handleStudentSelect = (student_user, student_full_name) => {
    //     setNewThesis({ ...newThesis, student: student_user });
    //     setSelectedStudent(student_full_name);
    //     setShowStudentList(false);
    // };

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedLecturers, setSelectedLecturers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const handleStudentSelect = (studentId, studentName) => {
        setErrorMessage(''); // Xóa thông báo lỗi khi có sự lựa chọn mới
        const updatedStudents = [...selectedStudents];
        const studentIndex = updatedStudents.findIndex((student) => student.id === studentId);

        if (studentIndex > -1) {
            // Nếu sinh viên đã được chọn, loại bỏ khỏi danh sách
            updatedStudents.splice(studentIndex, 1);
        } else {
            // Nếu sinh viên chưa được chọn
            if (updatedStudents.length < 10) {
                // Giới hạn số lượng sinh viên
                updatedStudents.push({ id: studentId, name: studentName });
            } else {
                setErrorMessage('Bạn chỉ có thể chọn tối đa 10 sinh viên.');
                return;
            }
        }
        setSelectedStudents(updatedStudents);
        setShowStudentList(false);
    };

    const handleLecturerSelect = (lecturerId, lecturerName) => {
        setErrorMessage(''); // Xóa thông báo lỗi khi có sự lựa chọn mới
        const updatedLecturers = [...selectedLecturers];
        const lecturerIndex = updatedLecturers.findIndex((lecturer) => lecturer.id === lecturerId);

        if (lecturerIndex > -1) {
            // Nếu giảng viên đã được chọn, loại bỏ khỏi danh sách
            updatedLecturers.splice(lecturerIndex, 1);
        } else {
            // Nếu giảng viên chưa được chọn
            if (updatedLecturers.length < 2) {
                // Giới hạn số lượng giảng viên
                updatedLecturers.push({ id: lecturerId, name: lecturerName });
            } else {
                setErrorMessage('Bạn chỉ có thể chọn tối đa 2 giảng viên.');
                return;
            }
        }
        setSelectedLecturers(updatedLecturers);
        setShowLecturerList(false);
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
        setSelectedStudents([]);
        setSelectedLecturers([]);
        setShowCouncilList(false);
        setShowLecturerList(false);
        setShowMajorList(false);
        setShowSchoolYearList(false);
        setSelectedCouncil('');
        setSelectedMajor('');
        setSelectedSchoolYear('');
    };

    const handleUpdateStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const api = authApi(token);

            // Lặp qua từng sinh viên đã chọn để cập nhật
            for (const student of selectedStudents) {
                const formData = new FormData();
                formData.append('thesis', newThesis.code);

                await api.patch(endpoints['update-student'](student.id), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            // Thông báo thành công
            alert('Cập nhật sinh viên thành công.');
        } catch (error) {
            console.error(error);
            alert('Cập nhật sinh viên thất bại. Vui lòng thử lại.');
        }
    };

    const handleAddLecturers = async (thesis_code) => {
        try {
            console.log(selectedLecturers, thesis_code);

            // Xử lý endpoint để thêm giảng viên
            const url = `${endpoints['theses']}/${thesis_code}/add_lecturer/`;

            for (const lecturer of selectedLecturers) {
                const formData = new FormData();
                formData.append('lecturer_code', lecturer.id);
                await APIs.post(url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRFToken': 'your-csrf-token',
                    },
                });
            }

            // Thông báo thành công
            alert('Thêm thành công giảng viên hướng dẫn.');
        } catch (error) {
            console.error(error);
            alert('Lỗi thêm giảng viên hướng dẫn. Vui lòng thử lại.');
        }
    };

    const handleAddThesis = async () => {
        console.log(newThesis);
        setLoading(true);
        try {
            if (selectedLecturers.length > 2) {
                Alert.alert('Thông báo', 'Chỉ được chọn tối đa 2 giảng viên hướng dẫn.');
                return;
            }
            // Make sure all required fields are filled
            if (
                !newThesis.code ||
                !newThesis.name ||
                !newThesis.start_date ||
                !newThesis.end_date ||
                !newThesis.council ||
                !newThesis.major ||
                !newThesis.school_year ||
                selectedLecturers.length === 0 ||
                selectedStudents.length === 0
            ) {
                setError('Vui lòng điền đầy đủ thông tin.');
                return;
            }
            const res = await APIs.post(endpoints['theses'], newThesis, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            handleAddLecturers(res.data.code);
            handleUpdateStudents();

            loadThese();
            setThesisData([...thesisData, res.data]);
            setFilteredThese([...filteredThese, res.data]);
            setShowAddModal(false);
            setSelectedCouncil('');
            setSelectedLecturers([]);
            setSelectedStudents([]);
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

    const handleShowUpdateModal = (thesis) => {
        setSelectedThesis(thesis);
        setShowUpdateModal(true);
    };

    const handleUpdateThesis = async () => {
        try {
            console.log(selectedThesis, newThesis.council, newThesis.major, newThesis.school_year);

            const formData = new FormData();
            formData.append('name', selectedThesis.name);
            formData.append('start_date', selectedThesis.start_date);
            formData.append('end_date', selectedThesis.end_date);
            formData.append('reportFile', selectedThesis.report_file);
            formData.append('council', newThesis.council);
            formData.append('major', newThesis.major);
            formData.append('school_year', newThesis.school_year);

            await APIs.patch(endpoints['update-thesis'](selectedThesis.code), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            handleCloseModal();
            loadThese();
            alert('Cập nhật khóa luận thành công!');
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert('Cập nhật khóa luận thất bại. Vui lòng thử lại.');
        }
    };

    const handleExportPDF = async (item) => {
        try {
            const token = localStorage.getItem('token');
            const response = await authApi(token).get(endpoints['these_generate-pdf'](item.code));
            const { file_url } = response.data;

            if (file_url) {
                window.open(file_url, '_blank');
            } else {
                alert('Không tìm thấy đường dẫn file PDF');
            }
        } catch (error) {
            alert('Đã xảy ra lỗi khi xuất file PDF');
        }
    };

    return (
        <div>
            <div>
                <div className="thesis-header">
                    <h1 className="thesis-title">QUẢN LÍ KHÓA LUẬN</h1>
                </div>

                {loading && <p>Đang tải...</p>}
                {error && <Alert variant="danger">{error}</Alert>}

                <div className="theses-container">
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

                    {/* Bọc bảng trong div có lớp cho phép cuộn ngang */}
                    <div className="table-responsive">
                        <table className="theses-table">
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
                                    <th>Sinh viên thực hiện</th>
                                    <th>Chuyên nghành</th>
                                    <th>Niên khóa</th>
                                    <th>Xuất bảng điểm</th>
                                    <th>Cập nhật</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredThese && filteredThese.length > 0 ? (
                                    filteredThese.map((thesis, index) => (
                                        <tr key={index}>
                                            <td>{thesis.code}</td>
                                            <td>{thesis.name}</td>
                                            <td>{moment(thesis.start_date).format('DD/MM/YYYY')}</td>
                                            <td>{moment(thesis.end_date).format('DD/MM/YYYY')}</td>
                                            <td>
                                                {thesis.report_file ? (
                                                    <a
                                                        href={thesis.report_file}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
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
                                                {thesis.lecturers && thesis.lecturers.length > 0
                                                    ? thesis.lecturers.map((lecturer, i) => (
                                                          <div key={i}>{lecturer.full_name}</div>
                                                      ))
                                                    : 'Chưa có giảng viên'}
                                            </td>
                                            <td>
                                                {thesis.students && thesis.students.length > 0
                                                    ? thesis.students.map((student, i) => (
                                                          <div key={i}>{student.full_name}</div>
                                                      ))
                                                    : 'Chưa có sinh viên'}
                                            </td>
                                            <td>{thesis.major}</td>
                                            <td>{thesis.school_year}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => handleShowUpdateModal(thesis)}
                                                >
                                                    Cập nhật
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => handleExportPDF(thesis)}
                                                >
                                                    Xuất bảng điểm
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="14">Không có khóa luận nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal cập nhật khóa luận */}
            <Modal show={showUpdateModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật khóa luận</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Tên khóa luận</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedThesis?.name || ''}
                                onChange={(e) => setSelectedThesis({ ...selectedThesis, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formStartDate">
                            <Form.Label>Ngày bắt đầu</Form.Label>
                            <Form.Control
                                type="date"
                                value={selectedThesis?.start_date || ''}
                                onChange={(e) => setSelectedThesis({ ...selectedThesis, start_date: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEndDate">
                            <Form.Label>Ngày kết thúc</Form.Label>
                            <Form.Control
                                type="date"
                                value={selectedThesis?.end_date || ''}
                                onChange={(e) => setSelectedThesis({ ...selectedThesis, end_date: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formReportFile">
                            <Form.Label>File báo cáo</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedThesis?.report_file || 'Thêm file báo cáo...'}
                                onChange={(e) => setSelectedThesis({ ...selectedThesis, report_file: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCouncil">
                            <Form.Label>Hội đồng</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn hội đồng"
                                value={selectedThesis?.council}
                                onClick={handleCouncilInputClick}
                                readOnly
                            />
                            {showCouncilList && (
                                <div className="option-list">
                                    {councils.map((council) => (
                                        <div
                                            key={council.id}
                                            className="option-item"
                                            onClick={() => {
                                                handleCouncilSelect(council.id, council.name);
                                                setSelectedThesis({ ...selectedThesis, major: council.name });
                                            }}
                                        >
                                            {council.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        <Form.Group controlId="formMajor">
                            <Form.Label>Chuyên Ngành</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn chuyên nghành"
                                value={selectedThesis?.major}
                                onClick={handleMajorInputClick}
                                readOnly
                            />
                            {showMajorList && (
                                <div className="option-list">
                                    {majors.map((major) => (
                                        <div
                                            key={major.code}
                                            className="option-item"
                                            onClick={() => {
                                                handleMajorSelect(major.code, major.name);
                                                setSelectedThesis({ ...selectedThesis, major: major.name });
                                            }}
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
                                value={selectedThesis?.school_year}
                                onClick={handleSchoolYearInputClick}
                                readOnly
                            />
                            {showSchoolYearList && (
                                <div className="option-list">
                                    {schoolYears.map((school_year) => (
                                        <div
                                            key={school_year.id}
                                            className="option-item"
                                            onClick={() => {
                                                handleSchoolYearSelect(school_year.id, school_year.name);
                                                setSelectedThesis({ ...selectedThesis, school_year: school_year.name });
                                            }}
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
                    <Button variant="primary" onClick={handleUpdateThesis}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>

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
                                <div className="option-list">
                                    {councils.map((council) => (
                                        <div
                                            key={council.id}
                                            className="option-item"
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
                                value={selectedLecturers.map((lecturer) => lecturer.name).join(', ')}
                                onClick={handleLecturerInputClick}
                                readOnly
                            />
                            {showLecturerList && (
                                <div className="option-list">
                                    {lecturers.map((lecturer) => (
                                        <div
                                            key={lecturer.user}
                                            className={`option-item ${
                                                selectedLecturers.find((l) => l.id === lecturer.user) ? 'selected' : ''
                                            }`}
                                            onClick={() => handleLecturerSelect(lecturer.user, lecturer.full_name)}
                                        >
                                            {lecturer.full_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group controlId="formStudent">
                            <Form.Label>Sinh viên thực hiện</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn sinh viên thực hiện"
                                value={selectedStudents.map((student) => student.name).join(', ')}
                                onClick={handleStudentInputClick}
                                readOnly
                            />
                            {showStudentList && (
                                <div className="option-list">
                                    {students.map((student) => (
                                        <div
                                            key={student.user}
                                            className={`option-item ${
                                                selectedStudents.find((s) => s.id === student.user) ? 'selected' : ''
                                            }`}
                                            onClick={() => handleStudentSelect(student.user, student.full_name)}
                                        >
                                            {student.full_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>

                        {errorMessage && <div className="error-message">{errorMessage}</div>}
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
                                <div className="option-list">
                                    {majors.map((major) => (
                                        <div
                                            key={major.code}
                                            className="option-item"
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
                                <div className="option-list">
                                    {schoolYears.map((school_year) => (
                                        <div
                                            key={school_year.id}
                                            className="option-item"
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

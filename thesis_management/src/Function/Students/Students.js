import React, { useContext, useState, useEffect } from 'react';
import { Alert, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MyUserContext } from '../../configs/Contexts';
import { authApi, endpoints } from '../../configs/APIs';
import moment from 'moment';
import './StudentsStyle.css';

const Students = () => {
    const user = useContext(MyUserContext) || {};
    const navigate = useNavigate();
    const [majors, setMajors] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // States for modals
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newStudent, setNewStudent] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        gender: 'Chọn giới tính',
        code: '',
        full_name: '',
        birthday: '',
        address: '',
        major: 'Chọn chuyên ngành',
        gpa: '',
        thesis: '',
    });
    const [showMajorList, setShowMajorList] = useState(false);
    const [showGenderList, setShowGenderList] = useState(false);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const api = authApi(token);
            const response = await api.get(endpoints['students']);
            setStudents(response.data.results);
            setFilteredStudents(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách sinh viên. Vui lòng thử lại sau.');
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

    useEffect(() => {
        loadStudents();
        loadMajors();
    }, []);

    const handleDelete = (studentId) => {
        setStudentToDelete(studentId);
        setShowDeleteModal(true);
    };

    const confirmDeleteStudent = async () => {
        if (studentToDelete) {
            try {
                const token = localStorage.getItem('token');
                const api = authApi(token);
                await api.delete(endpoints['delete-student'](studentToDelete));
                loadStudents();
                alert('Sinh viên đã được xóa thành công!');
            } catch (error) {
                console.error(error);
                alert('Không thể xóa sinh viên. Vui lòng thử lại sau.');
            } finally {
                setShowDeleteModal(false);
                setStudentToDelete(null);
            }
        }
    };

    const handleShowUpdateModal = (student) => {
        setSelectedStudent(student);
        setShowUpdateModal(true);
    };

    const handleShowAddModal = () => {
        setNewStudent({
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            phone: '',
            gender: 'Chọn giới tính',
            code: '',
            full_name: '',
            birthday: '',
            address: '',
            major: 'Chọn chuyên ngành',
            gpa: '',
            thesis: '',
        });
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setShowAddModal(false);
        setSelectedStudent(null);
        setShowMajorList(false); // Close major list on modal close
        setShowGenderList(false); // Close gender list on modal close
    };

    const handleUpdateStudent = async () => {
        try {
            const token = localStorage.getItem('token');
            const api = authApi(token);

            const formData = new FormData();
            formData.append('user', selectedStudent.user);
            formData.append('code', selectedStudent.code);
            formData.append('full_name', selectedStudent.full_name);
            formData.append('birthday', selectedStudent.birthday);
            formData.append('address', selectedStudent.address);
            formData.append('gpa', selectedStudent.gpa);
            if (selectedStudent.thesis) {
                formData.append('thesis', selectedStudent.thesis);
            }

            await api.patch(endpoints['update-student'](selectedStudent.user), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            loadStudents();
            alert('Cập nhật sinh viên thành công!');
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert('Cập nhật sinh viên thất bại. Vui lòng thử lại.');
        }
    };

    const handleAddStudent = async () => {
        if (newStudent.password !== newStudent.confirmPassword) {
            alert('Mật khẩu và xác nhận mật khẩu không khớp!');
            return;
        }

        console.log(newStudent);

        try {
            const token = localStorage.getItem('token');
            const api = authApi(token);

            // Step 1: Create User object
            const userFormData = new FormData();
            userFormData.append('username', newStudent.username);
            userFormData.append('password ', newStudent.password);
            userFormData.append('phone', newStudent.phone);
            userFormData.append('gender', newStudent.gender);
            userFormData.append('role', 'student');

            const userResponse = await api.post(endpoints['users'], userFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Step 2: Create Student object with the User ID
            const userId = userResponse.data.id; // Assuming the response returns the created user ID
            console.log(userId);
            const studentFormData = new FormData();
            studentFormData.append('user', userId); // Link to the created user
            studentFormData.append('code', newStudent.code);
            studentFormData.append('full_name', newStudent.full_name);
            studentFormData.append('birthday', newStudent.birthday);
            studentFormData.append('address', newStudent.address);
            studentFormData.append('major', newStudent.major);
            studentFormData.append('gpa', newStudent.gpa);

            console.log(studentFormData);

            await api.post(endpoints['students'], studentFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            loadStudents();
            alert('Thêm sinh viên thành công!');
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert('Thêm sinh viên thất bại. Vui lòng thử lại.');
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = students.filter(
            (student) =>
                student.full_name.toLowerCase().includes(query) ||
                student.code.toLowerCase().includes(query) ||
                student.address.toLowerCase().includes(query) ||
                student.major.toLowerCase().includes(query),
        );
        setFilteredStudents(filtered);
    };

    // Handle major input click to toggle the list
    const handleMajorInputClick = () => {
        setShowMajorList(!showMajorList);
    };

    // Select a major from the list
    const handleMajorSelect = (major_code, major_name) => {
        setNewStudent({ ...newStudent, major: major_code });
        setSelectedMajor(major_name);
        setShowMajorList(false);
    };

    // Handle gender input click to toggle the list
    const handleGenderInputClick = () => {
        setShowGenderList(!showGenderList);
    };

    // Select a gender from the list
    const handleGenderSelect = (gender) => {
        setNewStudent({ ...newStudent, gender });
        setShowGenderList(false);
    };

    return (
        <div className="std-container">
            <div className="student-header">
                <h1 className="student-title">QUẢN LÍ SINH VIÊN</h1>
            </div>

            {loading && <p>Đang tải...</p>}
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="students-container">
                <div className="search-container">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm sinh viên..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <button type="button" className="btn btn-primary add-btn" onClick={handleShowAddModal}>
                        Thêm sinh viên
                    </button>
                </div>
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Mã số sinh viên</th>
                            <th>Họ và tên</th>
                            <th>Ngày sinh</th>
                            <th>Quê quán</th>
                            <th>Ngành</th>
                            <th>GPA</th>
                            <th>Cập nhật</th>
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student, index) => (
                            <tr key={index}>
                                <td>{student.code}</td>
                                <td>{student.full_name}</td>
                                <td>{moment(student.birthday).format('DD/MM/YYYY')}</td>
                                <td>{student.address}</td>
                                <td>{student.major}</td>
                                <td>{student.gpa}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => handleShowUpdateModal(student)}
                                    >
                                        Cập nhật
                                    </button>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(student.user)}
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
                <Modal.Body>Bạn có chắc chắn muốn xóa sinh viên này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteStudent}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal cập nhật sinh viên */}
            <Modal show={showUpdateModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật sinh viên</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCode">
                            <Form.Label>Mã số sinh viên</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedStudent?.code || ''}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, code: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formFullName">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedStudent?.full_name || ''}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, full_name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formBirthday">
                            <Form.Label>Ngày sinh</Form.Label>
                            <Form.Control
                                type="date"
                                value={selectedStudent?.birthday || ''}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, birthday: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAddress">
                            <Form.Label>Quê quán</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedStudent?.address || ''}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, address: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formGPA">
                            <Form.Label>GPA</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedStudent?.gpa || ''}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, gpa: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleUpdateStudent}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal thêm sinh viên */}
            <Modal show={showAddModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm sinh viên</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Tên đăng nhập</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={newStudent.username}
                                onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={newStudent.password}
                                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formConfirmPassword">
                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={newStudent.confirmPassword}
                                onChange={(e) => setNewStudent({ ...newStudent, confirmPassword: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email"
                                value={newStudent.email}
                                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhone">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập số điện thoại"
                                value={newStudent.phone}
                                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formGender">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Control
                                type="text"
                                value={newStudent.gender}
                                onClick={handleGenderInputClick}
                                readOnly
                            />
                            {showGenderList && (
                                <div className="major-list">
                                    <div className="major-item" onClick={() => handleGenderSelect('Nam')}>
                                        Nam
                                    </div>
                                    <div className="major-item" onClick={() => handleGenderSelect('Nữ')}>
                                        Nữ
                                    </div>
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group controlId="formCode">
                            <Form.Label>Mã số sinh viên</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập mã số sinh viên"
                                value={newStudent.code}
                                onChange={(e) => setNewStudent({ ...newStudent, code: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formFullName">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập họ và tên"
                                value={newStudent.full_name}
                                onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formBirthday">
                            <Form.Label>Ngày sinh</Form.Label>
                            <Form.Control
                                type="date"
                                value={newStudent.birthday}
                                onChange={(e) => setNewStudent({ ...newStudent, birthday: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAddress">
                            <Form.Label>Quê quán</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập quê quán"
                                value={newStudent.address}
                                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formMajor">
                            <Form.Label>Chuyên ngành</Form.Label>
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
                        <Form.Group controlId="formGPA">
                            <Form.Label>GPA</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập GPA"
                                value={newStudent.gpa}
                                onChange={(e) => setNewStudent({ ...newStudent, gpa: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleAddStudent}>
                        Thêm sinh viên
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Students;

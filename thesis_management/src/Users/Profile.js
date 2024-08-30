import React, { useContext, useState, useEffect } from 'react';
import { Button, Modal, Form, Image, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MyDispatchContext, MyUserContext } from '../configs/Contexts';
import { authApi, endpoints } from '../configs/APIs';
import moment from 'moment';
import { FaCamera, FaKey, FaSignOutAlt, FaEye, FaEyeSlash } from 'react-icons/fa'; 
import './ProfileStyle.css';

const Profile = () => {
    const user = useContext(MyUserContext) || {};
    const dispatch = useContext(MyDispatchContext);
    const navigate = useNavigate();

    const [avatar, setAvatar] = useState(user.avatar || '');
    const [newAvatar, setNewAvatar] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [confirmAvatarModalVisible, setConfirmAvatarModalVisible] = useState(false); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [visible3, setVisible3] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState(''); 

    useEffect(() => {
        console.log('User context:', user); 
        const fetchUserData = () => {
            const storedUsername = localStorage.getItem("username");
            const storedPassword = localStorage.getItem("password");
            setUsername(storedUsername || "");
            setPassword(storedPassword || ""); 
        };
        fetchUserData();
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        dispatch({ type: "logout" });
        navigate('/');
    };

    const handleChangePassword = async () => {
        setModalError(''); 

        if (!oldPassword || !newPassword || !confirmPassword) {
            setModalError('vui lòng điền tất cả thông tin');
            return;
        }
        if (oldPassword !== password) { 
            setModalError('Mật khẩu cũ không chính xác');
            return;
        }
        if (newPassword !== confirmPassword) {
            setModalError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        const formData = new FormData();
        formData.append('password', newPassword);

        try {
            const token = localStorage.getItem("token");
            const api = authApi(token);
            const response = await api.patch(endpoints['current-user'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                alert('Mật khẩu thay đổi thành công');
                setPassword(newPassword); 
                setOldPassword(''); 
                setNewPassword('');
                setConfirmPassword('');
                localStorage.setItem("password", newPassword); 
                setModalVisible(false);
            } else {
                setModalError('Thay đổi mật khẩu thất bại');
            }
        } catch (error) {
            setModalError('Lỗi trong khi thay đổi mật khẩu');
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewAvatar(file); 
            setAvatar(URL.createObjectURL(file));
            setConfirmAvatarModalVisible(true); 
        }
    };

    const handleConfirmAvatarChange = async () => {
        if (!newAvatar) return;

        const formData = new FormData();
        formData.append('avatar', newAvatar);

        try {
            const token = localStorage.getItem("token");
            const api = authApi(token);
            const response = await api.patch(endpoints['current-user'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                alert('Avatar updated successfully');
                setAvatar(URL.createObjectURL(newAvatar)); 
                setNewAvatar(null); 
                setAvatarModalVisible(false);
            } else {
                setError('Failed to update avatar');
            }
        } catch (error) {
            setError('Error occurred while updating avatar');
        }
        setConfirmAvatarModalVisible(false); 
    };

    const handleCancelAvatarChange = () => {
        setAvatar(user.avatar || '');
        setNewAvatar(null);
        setConfirmAvatarModalVisible(false);
    };

    const dateInput = user.role === 'student' ? user.student?.birthday :
        user.role === 'lecturer' ? user.lecturer?.birthday :
        user.role === 'ministry' ? user.ministry?.birthday :
        null;

    const formattedDate = dateInput ? moment(dateInput).format('DD-MM-YYYY') : 'N/A';

    return (
        <div className="profile-container">
            <Row className="profile-header">
                <Col>
                    <h1 className="profile-title">PROFILE</h1>
                </Col>
                <Col className="profile-header-actions">
                    <FaKey
                        className="profile-icon"
                        onClick={() => setModalVisible(true)}
                        title="Change Password"
                    />
                    <FaSignOutAlt
                        className="profile-icon"
                        onClick={handleLogout}
                        title="Logout"
                    />
                </Col>
            </Row>
            <Row>
                <Col className="profile-avatar">
                    <Image
                        src={avatar || 'default-avatar-url'}
                        roundedCircle
                        width={200}
                        height={200}
                        onClick={() => setAvatarModalVisible(true)}
                    />
                    <label htmlFor="avatarUpload">
                        <FaCamera className="camera-icon" />
                    </label>
                    <Form.Control
                        id="avatarUpload"
                        type="file"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                    />
                </Col>
            </Row>
            <Row className="profile-content">
                <Col>
                    <div className="profile-info">
                        {user.role === "student" && (
                            <>
                                <p>{user.student?.full_name}</p>
                                <p>Mã số sinh viên: {user.student?.code}</p>
                                <p>Ngày sinh: {formattedDate}</p>
                                <p>Giới tính: {user.gender}</p>
                                <p>Số điện thoại: {user.phone}</p>
                                <p>Email: {user.email}</p>
                                <p>Địa chỉ: {user.student?.address}</p>
                                <p>GPA: {user.student?.gpa}</p>
                                <p>Ngành: {user.student?.major}</p>
                            </>
                        )}
                        {user.role === "lecturer" && (
                            <>
                                <p>{user.lecturer?.full_name}</p>
                                <p>Mã số giảng viên: {user.lecturer?.code}</p>
                                <p>Ngày sinh: {formattedDate}</p>
                                <p>Giới tính: {user.gender}</p>
                                <p>Số điện thoại: {user.phone}</p>
                                <p>Email: {user.email}</p>
                                <p>Địa chỉ: {user.lecturer?.address}</p>
                                <p>Khoa: {user.lecturer?.faculty}</p>
                            </>
                        )}
                        {user.role === "ministry" && (
                            <>
                                <p>{user.ministry?.full_name}</p>
                                <p>ID: {user.ministry?.code}</p>
                                <p>Ngày sinh: {formattedDate}</p>
                                <p>Giới tính: {user.gender}</p>
                                <p>Số điện thoại: {user.phone}</p>
                                <p>Email: {user.email}</p>
                                <p>Địa chỉ: {user.ministry?.address}</p>
                            </>
                        )}
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                </Col>
            </Row>

            <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formOldPassword">
                            <Form.Label>Mật khẩu cũ</Form.Label>
                            <div className="input-wrapper">
                                <Form.Control
                                    type={visible ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                                <span className="icon-eye" onClick={() => setVisible(!visible)}>
                                    {visible ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </Form.Group>
                        <Form.Group controlId="formNewPassword">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <div className="input-wrapper">
                                <Form.Control
                                    type={visible2 ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <span className="icon-eye" onClick={() => setVisible2(!visible2)}>
                                    {visible2 ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </Form.Group>
                        <Form.Group controlId="formConfirmPassword">
                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                            <div className="input-wrapper">
                                <Form.Control
                                    type={visible3 ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <span className="icon-eye" onClick={() => setVisible3(!visible3)}>
                                    {visible3 ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </Form.Group>
                        {modalError && <Alert variant="danger">{modalError}</Alert>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleChangePassword}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={avatarModalVisible} onHide={() => setAvatarModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Avatar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Image src={avatar || 'default-avatar-url'} roundedCircle width={200} height={200} />
                    <p>Click vào icon camera để thay đổi avatar</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setAvatarModalVisible(false)}>
                        Hủy
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={confirmAvatarModalVisible} onHide={() => setConfirmAvatarModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận đổi avatar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Image src={avatar || 'default-avatar-url'} roundedCircle width={200} height={200} />
                    <p>Bạn chắc chắn sẽ thay đổi?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelAvatarChange}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleConfirmAvatarChange}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Profile;

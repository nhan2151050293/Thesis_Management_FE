import React, { useState, useContext } from 'react';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import APIs, { authApi, endpoints } from '../configs/APIs';
import { useNavigate } from 'react-router-dom';
import { MyDispatchContext } from '../configs/Contexts'; // Import MyDispatchContext
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginStyle.css';

const Login = () => {
    const [user, setUser] = useState({});
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [isInfoEntered, setIsInfoEntered] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useContext(MyDispatchContext); // Use the context

    const fields = [
        {
            label: "Tên đăng nhập",
            icon: "account",
            name: "username",
        },
        {
            label: "Mật khẩu",
            icon: !visible ? "eye-off" : "eye",
            name: "password",
            type: visible ? "text" : "password",
        },
    ];

    const updateState = (field, value) => {
        setUser((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const login = async () => {
        setLoading(true);
        try {
            if (!isInfoEntered) {
                throw new Error("Vui lòng nhập đầy đủ thông tin đăng nhập");
            }
    
            const response = await APIs.post(endpoints['login'], {
                ...user,
                client_id: 'dgUWVUFcjUa5a96UG1EThst7K2akAWfMDcZKjSOt',
                client_secret: 'YhpIccJIWQUVwDqAAoAWbKOOlCwieC1ZURuov8i7HB0bKos6KMLt9ku5ZquXZhiOxJ1LM4gQSJRxwBcSjnyRY7mpiOxXX9b3JOr0TMeigyXD7ZpEz82o5z96qWWH5TH3',
                grant_type: 'password',
            });
    
            // Save token and password to localStorage
            localStorage.setItem("token", response.data.access_token);
            localStorage.setItem("password", user.password); // Save the password
    
            // Fetch user info
            const userResponse = await authApi(response.data.access_token).get(endpoints['current-user']);
    
            // Dispatch action to update user context
            dispatch({ type: "login", payload: userResponse.data });
    
            // Navigate to Home page
            navigate('/Home');
    
            // Log user info for debugging
            console.log("User Information:", userResponse.data);
    
        } catch (error) {
            console.error("Login error:", error);
            setError(
                error.message === "Vui lòng nhập đầy đủ thông tin đăng nhập"
                    ? "Vui lòng nhập đầy đủ thông tin đăng nhập"
                    : "Tên đăng nhập hoặc mật khẩu không đúng!"
            );
        } finally {
            setLoading(false);
        }
    };

    const onFieldChange = (field, value) => {
        updateState(field, value);
        setIsInfoEntered(user.username?.trim() !== "" && user.password?.trim() !== "");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            login();
        }
    };

    return (
        <div className="background">
            <div className="Login_text">
                <h1>LOGIN</h1>
            </div>
            <div className="Login_Box">
                <Row>
                    <Col>
                        <div>
                            <Form onKeyDown={handleKeyDown}>
                                {fields.map((field) => (
                                    <Form.Group controlId={field.name} key={field.name} className="position-relative">
                                        <Form.Control
                                            type={field.type || "text"}
                                            placeholder={field.label}
                                            className="Login_TextBox"
                                            onChange={(e) => onFieldChange(field.name, e.target.value)}
                                        />
                                        {field.name === 'password' && (
                                            <span
                                                className="password-toggle-icon"
                                                onClick={() => setVisible(!visible)}
                                            >
                                                {visible ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        )}
                                    </Form.Group>
                                ))}
                                {error && (
                                    <Alert variant="danger">{error}</Alert>
                                )}
                                <div>
                                    <Button
                                        type="button"
                                        style={{
                                            width: '100%',
                                            backgroundColor: loading ? '#747958' : '#dee1d7', // Change the background color when loading
                                            borderColor: loading ? '#747958' : '#dee1d7' // Ensure the border matches the background
                                        }}
                                        className="Login_button"
                                        onClick={login}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Spinner animation="border" role="status" size="sm">
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                        ) : "Đăng Nhập"}
                                    </Button>

                                </div>
                            </Form>
                        </div>
                    </Col>
                    <div className="Forget_pass">
                        <p>Quên mật khẩu vui lòng liên hệ với Admin</p>
                    </div>
                </Row>
            </div>
        </div>
    );
};

export default Login;

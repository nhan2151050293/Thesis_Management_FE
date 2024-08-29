import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import APIs, { authApi, endpoints } from '../configs/APIs';
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginStyle.css';

const Login = () => {
    const [user, setUser] = useState({});
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [isInfoEntered, setIsInfoEntered] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


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
    
            console.log("Attempting login with user:", user);
    
            const response = await APIs.post(endpoints.login, {
                ...user,
                client_id: 'dgUWVUFcjUa5a96UG1EThst7K2akAWfMDcZKjSOt',
                client_secret: 'YhpIccJIWQUVwDqAAoAWbKOOlCwieC1ZURuov8i7HB0bKos6KMLt9ku5ZquXZhiOxJ1LM4gQSJRxwBcSjnyRY7mpiOxXX9b3JOr0TMeigyXD7ZpEz82o5z96qWWH5TH3',
                grant_type: 'password',
            });
    
            console.log("Login response:", response);
    
            const token = response.data.access_token;
            localStorage.setItem("token", token);
    
            const userResponse = await authApi(token).get(endpoints.currentUser);
    
            console.log("User logged in:", userResponse.data);
    
            // Navigate to Home page
            navigate('/Home');
    
        } catch (error) {
            console.error("Login error:", error);
    
            setError(
                error.response && error.response.data
                    ? "Tên đăng nhập hoặc mật khẩu không đúng!"
                    : "Vui lòng nhập đầy đủ thông tin đăng nhập"
            );
        } finally {
            setLoading(false);
        }
    };
    
    

    const onFieldChange = (field, value) => {
        updateState(field, value);
        setIsInfoEntered(fields.every((field) => user[field.name]?.trim() !== ""));
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
                                    style={{ width: '100%' }}
                                    className="Login_button"
                                    onClick={login}
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Đăng Nhập"}
                                </Button>
                            </div>
                        </div>
                    </Col>
                    <div className="Forget_pass">
                        <p>Quên mật khẩu vui lòng liên hệ với Admin</p>
                    </div>
                </Row>
            </div>
        </div>
    );
}

export default Login;

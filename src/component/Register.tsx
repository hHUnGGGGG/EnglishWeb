import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css"; // CSS giống Login

const Register: React.FC = () => {
    const [nameAcc, setNameAcc] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!nameAcc.trim() || !password.trim() || !fullName.trim()) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:8080/users/register", {
                nameAcc,
                password,
                fullName
            });

            if (response.data === "Đăng ký thành công!") {
                alert("Đăng ký thành công! Chuyển hướng đến trang đăng nhập...");
                navigate("/login");
            } else {
                setError(response.data);
            }
        } catch (error) {
            console.error("Lỗi đăng ký", error);
            setError("Lỗi khi đăng ký tài khoản!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2>Đăng ký tài khoản</h2>
                    <p>Vui lòng nhập thông tin để tạo tài khoản mới</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="nameAcc">Tên đăng nhập</label>
                    <input
                        type="text"
                        id="nameAcc"
                        value={nameAcc}
                        onChange={(e) => setNameAcc(e.target.value)}
                        placeholder="Nhập tên đăng nhập"
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="fullName">Họ và Tên</label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên"
                        disabled={isLoading}
                    />
                </div>

                <button className="register-button" onClick={handleRegister} disabled={isLoading}>
                    {isLoading ? <span className="spinner"></span> : "Đăng ký"}
                </button>

                <div className="register-footer">
                    <a onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
                        Đã có tài khoản? Đăng nhập
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Register;

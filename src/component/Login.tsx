import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NinjaAnimation from "./NinjaAnimation";
import "./Login.css"; // We'll create this CSS file

const Login: React.FC = () => {
    const [nameAcc, setNameAcc] = useState("");
    const [password, setPassword] = useState("");
    const [showNinja, setShowNinja] = useState(false);
    const [redirectTo, setRedirectTo] = useState("/dashboard");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!nameAcc.trim() || !password.trim()) {
            setError("Vui lòng nhập tên đăng nhập và mật khẩu");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axios.get("http://localhost:8080/users/login", {
                params: { nameAcc, password },
            });

            if (response.data === "Đăng nhập thành công!") {
                const userResponse = await axios.get(`http://localhost:8080/users/user/${nameAcc}`);
                console.log("Thông tin người dùng:", userResponse.data);
                localStorage.setItem("user", JSON.stringify(userResponse.data));

                // Kiểm tra tài khoản admin
                const redirectPath = nameAcc.toLowerCase() === "admin" ? "/admin" : "/dashboard";
                setRedirectTo(redirectPath);
                setShowNinja(true);
            } else {
                setError("Tên đăng nhập hoặc mật khẩu không đúng");
            }
        } catch (error) {
            console.error("Lỗi đăng nhập", error);
            setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            {showNinja ? (
                <NinjaAnimation onAnimationEnd={() => navigate(redirectTo)} />
            ) : (
                <div className="login-card">
                    <div className="login-header">
                        <h2>Chào mừng trở lại</h2>
                        <p>Vui lòng đăng nhập để tiếp tục</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={nameAcc}
                            onChange={(e) => setNameAcc(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        className="login-button"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>

                    <div className="login-footer">
                        <a href="#forgot-password">Quên mật khẩu?</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
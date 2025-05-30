import axios from "axios";

const API_URL = "http://localhost:8080/users"; // URL của Spring Boot

// Đăng ký tài khoản
export const registerUser = async (nameAcc, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, null, {
            params: { nameAcc, password }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        return "Lỗi khi đăng ký!";
    }
};

// Đăng nhập tài khoản
export const loginUser = async (nameAcc, password) => {
    try {
        const response = await axios.get(`${API_URL}/login`, {
            params: { nameAcc, password }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        return "Lỗi khi đăng nhập!";
    }
};
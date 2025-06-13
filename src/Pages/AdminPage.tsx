import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();

    const handleAutoClick = () => {
        navigate('/admin/auto');
    };

    const handleManualClick = () => {
        navigate('/admin/manual');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-8">Trang quản trị nội dung</h1>
            <div className="space-y-4 w-full max-w-sm">
                <button
                    onClick={handleAutoClick}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg shadow hover:bg-blue-700 transition"
                >
                    Tạo nội dung tự động
                </button>
                <button
                    onClick={handleManualClick}
                    className="w-full bg-green-600 text-white py-3 rounded-xl text-lg shadow hover:bg-green-700 transition"
                >
                    Chỉnh sửa nội dung thủ công
                </button>
            </div>
        </div>
    );
};

export default AdminPage;

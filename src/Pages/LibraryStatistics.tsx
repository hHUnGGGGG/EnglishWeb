import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface LibraryStats {
    totalWords: number;
    totalCorrect: number;
    totalWrong: number;
}

interface DailyStat {
    date: string;
    totalWords: number;
    correctCount: number;
    wrongCount: number;
}

const LibraryStatistics: React.FC = () => {
    const [stats, setStats] = useState<LibraryStats | null>(null);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            setError("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }

        const userData = JSON.parse(storedUser);
        const userID = userData.userID;
        if (!userID) {
            setError("Thông tin user không hợp lệ.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const statsPromise = axios.get<LibraryStats>(
            `http://localhost:8080/api/library/statistics/${userID}`
        );
        const dailyStatsPromise = axios.get<DailyStat[]>(
            `http://localhost:8080/api/library/daily-statistics/${userID}`
        );

        Promise.all([statsPromise, dailyStatsPromise])
            .then(([statsRes, dailyRes]) => {
                setStats(statsRes.data);
                setDailyStats(dailyRes.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy thống kê:", err);
                setError("Lỗi khi lấy dữ liệu thống kê từ server.");
                setLoading(false);
            });
    }, []);

    // Custom Tooltip để hiển thị totalWords, correctCount, wrongCount
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length >= 3) {
            const totalWords = payload.find((p: any) => p.dataKey === "totalWords")?.value || 0;
            const correct = payload.find((p: any) => p.dataKey === "correctCount")?.value || 0;
            const wrong = payload.find((p: any) => p.dataKey === "wrongCount")?.value || 0;

            return (
                <div
                    style={{
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        padding: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                >
                    <p>
                        <strong>Ngày:</strong> {label}
                    </p>
                    <p>
                        <strong>Tổng số từ đã học:</strong> {totalWords}
                    </p>
                    <p>Câu đúng: {correct}</p>
                    <p>Câu sai: {wrong}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2>📊 Thống kê thư viện</h2>

            {stats && (
                <div style={{ marginBottom: "20px" }}>
                    <p>
                        <strong>Tổng số từ đã học:</strong> {stats.totalWords}
                    </p>
                    <p>
                        <strong>Số câu trả lời đúng:</strong> {stats.totalCorrect}
                    </p>
                    <p>
                        <strong>Số câu trả lời sai:</strong> {stats.totalWrong}
                    </p>
                </div>
            )}

            <h3>📅 Thống kê trong 7 ngày gần nhất</h3>
            {dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={dailyStats}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="totalWords"
                            name="Tổng số từ"
                            fill="#2196f3"
                        />
                        <Bar
                            dataKey="correctCount"
                            name="Câu đúng"
                            fill="#4caf50"
                        />
                        <Bar
                            dataKey="wrongCount"
                            name="Câu sai"
                            fill="#f44336"
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p>Không có dữ liệu.</p>
            )}
        </div>
    );
};

export default LibraryStatistics;
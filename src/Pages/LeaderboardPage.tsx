import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LeaderboardEntry {
    userID: number;
    fullName: string;
    totalWords: number;
    totalCorrect: number;
}

interface MyRank {
    userID: number;
    rank: number;
    totalWords: number;
    totalCorrect: number;
}

const LeaderboardPage: React.FC = () => {
    const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [myRank, setMyRank] = useState<MyRank | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            setError("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }

        let userData: { userID?: number } | null = null;
        try {
            userData = JSON.parse(storedUser);
        } catch {
            setError("Dữ liệu người dùng không hợp lệ.");
            setLoading(false);
            return;
        }

        if (!userData || !userData.userID) {
            setError("Thông tin người dùng không hợp lệ.");
            setLoading(false);
            return;
        }

        fetchLeaderboard(userData.userID);
    }, [type]);

    const fetchLeaderboard = async (userID: number) => {
        setLoading(true);
        try {
            const [rankRes, listRes] = await Promise.all([
                axios.get<MyRank>(`http://localhost:8080/api/library/leaderboard/my-rank`, { params: { userID, type } }),
                axios.get<LeaderboardEntry[]>(`http://localhost:8080/api/library/leaderboard`, { params: { type } })
            ]);
            setMyRank(rankRes.data);
            setLeaderboard(listRes.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Không thể tải bảng xếp hạng.");
            setMyRank(null);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTitle = (type: string) => {
        switch (type) {
            case 'daily': return 'Today';
            case 'weekly': return 'This Week';
            case 'monthly': return 'This Month';
            default: return '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-center mb-6">
                🏆 Leaderboard - {formatTitle(type)}
            </h1>

            <div className="flex justify-center mb-4">
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="p-2 border rounded"
                >
                    <option value="daily">Today</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                </select>
            </div>

            {error && <p className="text-center text-red-500 font-medium">{error}</p>}

            {!error && myRank && (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-4 mb-6 shadow">
                    <p className="text-lg font-semibold text-yellow-800">
                        🧍‍♂️ Your Rank: #{myRank.rank}
                    </p>
                    <p>✅ Correct: {myRank.totalCorrect}</p>
                    <p>📘 Words: {myRank.totalWords}</p>
                </div>
            )}

            {!error && !loading && (
                <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Words Learned</th>
                        <th className="px-4 py-2">Correct Answers</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr
                            key={entry.userID}
                            className={`text-center ${
                                myRank && entry.userID === myRank.userID ? 'bg-yellow-50 font-semibold' : ''
                            }`}
                        >
                            <td className="px-4 py-2">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </td>
                            <td className="px-4 py-2">{entry.fullName}</td>
                            <td className="px-4 py-2">{entry.totalWords}</td>
                            <td className="px-4 py-2">{entry.totalCorrect}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {loading && !error && <p className="text-center">Đang tải dữ liệu...</p>}
        </div>
    );
};

export default LeaderboardPage;

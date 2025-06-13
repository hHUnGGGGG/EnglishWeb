import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import avatarGif from "../resource/image/luffy-gear-5-laughing-sticker.gif";

interface Topic {
    topicID: number;
    title: string;
    imagePath: string;
}

interface User {
    fullName: string;
}

const Dashboard: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [searchWord, setSearchWord] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData && userData.fullName) {
                setUser({ fullName: userData.fullName });
            } else {
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        axios.get("http://localhost:8080/topics/getAllTopics")
            .then(res => setTopics(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (searchWord.trim() === "") {
            setSuggestions([]);
            return;
        }
        const delayDebounce = setTimeout(() => {
            axios.get(`http://localhost:8080/vocabulary/suggest?keyword=${encodeURIComponent(searchWord.trim())}`)
                .then(res => setSuggestions(res.data))
                .catch(err => console.error("Lỗi khi gọi API suggest:", err));
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchWord]);

    const handleSelectSuggestion = (word: string) => {
        setSearchWord(word);
        setSuggestions([]);
        navigate(`/search/${encodeURIComponent(word)}`);
    };

    const handleSearch = () => {
        if (searchWord.trim()) {
            setSuggestions([]);
            navigate(`/search/${encodeURIComponent(searchWord.trim())}`);
        }
    };

    const handleTopicClick = (topicID: number) => {
        navigate(`/lessons/${topicID}`);
    };

    const handleMyLibraryClick = () => {
        navigate("/myLibrary");
    };

    const handleStatisticsClick = () => {
        navigate("/libraryStatistics");
    };

    const handleLeaderboardClick = () => {
        navigate("/leaderboard");
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                {user ? (
                    <div className="user-info">
                        <img src={avatarGif} alt="Avatar" className="user-avatar" />
                        <span className="user-fullname">{user.fullName}</span>
                    </div>
                ) : (
                    <div className="user-info">
                        <span>Đang tải thông tin người dùng...</span>
                    </div>
                )}
                <div className="top-right-controls">
                    <input
                        type="text"
                        placeholder="Tra từ..."
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        className="search-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                        autoComplete="off"
                    />
                    <button className="button" onClick={handleSearch}>Tra từ</button>
                    <button className="button" onClick={handleMyLibraryClick}>My Library</button>
                    <button className="button" onClick={handleStatisticsClick}>Thống kê</button>
                    <button className="button" onClick={handleLeaderboardClick}>Bảng Xếp Hạng</button>
                    <button className="button" onClick={() => navigate("/miniGame")}>Mini Game</button>
                    {suggestions.length > 0 && (
                        <ul className="autocomplete-list">
                            {suggestions.map((word, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectSuggestion(word)}
                                >
                                    {word}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </header>

            <h1>Danh Sách các chủ đề!</h1>
            <div className="topics-container">
                {topics.map(topic => (
                    <button
                        key={topic.topicID}
                        className="topic-button"
                        onClick={() => handleTopicClick(topic.topicID)}
                    >
                        <img src={topic.imagePath} alt={topic.title} className="topic-image" />
                        <p className="center-text">{topic.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;

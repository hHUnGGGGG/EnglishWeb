import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FlashcardPage.css"; // dùng lại CSS của flashcard

interface Vocabulary {
    vocabularyID: number;
    word: string;
    pronunciation: string;
    define: string;
    imagePath: string;
    topicID: number;
}

interface User {
    userID: number;
    fullName: string;
    avatar: string;
}

const MyLibrary: React.FC = () => {
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [flippedCardIds, setFlippedCardIds] = useState<Set<number>>(new Set());

    const navigate = useNavigate();

    // Kiểm tra người dùng
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
            return;
        }
    }, [navigate]);

    // Lấy danh sách từ đã lưu
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            setError("Không tìm thấy thông tin người dùng");
            setLoading(false);
            return;
        }
        const userData: User = JSON.parse(storedUser);
        axios
            .get("http://localhost:8080/vocabulary/myLibrary", {
                params: { userID: userData.userID }
            })
            .then(response => {
                setVocabularies(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi khi lấy từ vựng đã lưu:", err);
                setError("Không thể tải danh sách từ vựng đã lưu.");
                setLoading(false);
            });
    }, []);

    // Lật flashcard
    const handleFlip = (vocabularyID: number) => {
        const newSet = new Set(flippedCardIds);
        if (newSet.has(vocabularyID)) {
            newSet.delete(vocabularyID);
        } else {
            newSet.add(vocabularyID);
        }
        setFlippedCardIds(newSet);
    };

    // Đọc từ
    const handleSpeak = (word: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Trình duyệt của bạn không hỗ trợ Text-to-Speech.");
        }
    };

    // Điều hướng sang quiz
    const handleQuizClick = () => {
        navigate("/quiz/mylibrary");
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flashcard-page">
            <div className="flashcard-header">
                <h2>Thư viện từ vựng của bạn</h2>
                <button className="quiz-button" onClick={handleQuizClick}>
                    Kiểm tra
                </button>
            </div>

            {vocabularies.length === 0 ? (
                <p>Chưa có từ vựng nào được lưu.</p>
            ) : (
                <div className="flashcards-container">
                    {vocabularies.map((vocab) => (
                        <div
                            key={vocab.vocabularyID}
                            className="flashcard"
                            onClick={() => handleFlip(vocab.vocabularyID)}
                        >
                            <div className={`flashcard-inner ${flippedCardIds.has(vocab.vocabularyID) ? "flipped" : ""}`}>
                                <div className="flashcard-front">
                                    <h3>{vocab.word}</h3>
                                    <p>{vocab.pronunciation}</p>
                                </div>
                                <div className="flashcard-back">
                                    <p>{vocab.define}</p>
                                    <img
                                        src={vocab.imagePath}
                                        alt={vocab.word}
                                        className="flashcard-image"
                                    />
                                    <button
                                        onClick={(e) => handleSpeak(vocab.word, e)}
                                        className="speak-button"
                                    >
                                        Read
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLibrary;

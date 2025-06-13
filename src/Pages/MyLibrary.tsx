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
    const [userData, setUserData] = useState<User | null>(null);

    const navigate = useNavigate();

    // Kiểm tra người dùng
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
            return;
        }
        const user = JSON.parse(storedUser);
        setUserData(user);
    }, [navigate]);

    // Lấy danh sách từ đã lưu
    useEffect(() => {
        if (!userData) return;
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
    }, [userData]);

    const handleFlip = (vocabularyID: number) => {
        const newSet = new Set(flippedCardIds);
        newSet.has(vocabularyID) ? newSet.delete(vocabularyID) : newSet.add(vocabularyID);
        setFlippedCardIds(newSet);
    };

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

    const handleDelete = (vocabularyID: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userData) return;

        const confirmed = window.confirm("Bạn có chắc chắn muốn xoá từ này khỏi thư viện?");
        if (!confirmed) return;

        axios
            .delete("http://localhost:8080/vocabulary/library", {
                params: {
                    userID: userData.userID,
                    vocabularyID: vocabularyID
                }
            })
            .then(() => {
                // Cập nhật lại danh sách sau khi xoá
                setVocabularies(prev => prev.filter(v => v.vocabularyID !== vocabularyID));
            })
            .catch(err => {
                console.error("Lỗi khi xoá từ:", err);
                alert("Không thể xoá từ này khỏi thư viện.");
            });
    };

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
                                    <div className="button-group">
                                        <button
                                            onClick={(e) => handleSpeak(vocab.word, e)}
                                            className="speak-button"
                                        >
                                            Read
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(vocab.vocabularyID, e)}
                                            className="speak-button"
                                        >
                                            Delete
                                        </button>
                                    </div>
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
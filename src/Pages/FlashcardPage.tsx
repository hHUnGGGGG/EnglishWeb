import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FlashcardPage.css";

interface Vocabulary {
    vocabularyID: number;
    word: string;
    pronunciation: string;
    define: string;
    imagePath: string;
    topicID: number;
}

const FlashcardPage: React.FC = () => {
    const { lessonID } = useParams<{ lessonID: string }>();
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [flippedCardId, setFlippedCardId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!lessonID) {
            setError("Không tìm thấy lessonID!");
            setLoading(false);
            return;
        }

        axios.get(`http://localhost:8080/vocabulary/allByLessonID`, {
            params: { lessonID }
        })
            .then(response => {
                setVocabularies(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi khi lấy danh sách từ vựng:", err);
                setError("Không thể tải danh sách từ vựng.");
                setLoading(false);
            });
    }, [lessonID]);

    const getUserID = () => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            return user.userID;
        }
        return null;
    };

    const handleFlip = (vocabularyID: number) => {
        setFlippedCardId(flippedCardId === vocabularyID ? null : vocabularyID);
    };

    const handleSpeak = (word: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Text-to-speech không được hỗ trợ trên trình duyệt của bạn.");
        }
    };

    const handleAddToLibrary = (vocabularyID: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const userID = getUserID();
        if (!userID) {
            alert("Bạn chưa đăng nhập.");
            return;
        }

        axios.post("http://localhost:8080/vocabulary/myLibraryAdd", null, {
            params: {
                userID: userID,
                vocabularyID: vocabularyID
            }
        })
            .then(res => {
                alert(res.data);
            })
            .catch(err => {
                console.error("Lỗi khi thêm từ vào thư viện:", err);
                alert("Thêm từ thất bại!");
            });
    };

    const handleQuizClick = () => {
        navigate(`/quiz/${lessonID}`);
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flashcard-page">
            <div className="flashcard-header">
                <h2>Flashcards cho bài học {lessonID}</h2>
                <button className="quiz-button" onClick={handleQuizClick}>
                    Kiểm tra
                </button>
            </div>

            <div className="flashcards-container">
                {vocabularies.map((vocabulary) => (
                    <div
                        key={vocabulary.vocabularyID}
                        className="flashcard"
                        onClick={() => handleFlip(vocabulary.vocabularyID)}
                    >
                        <div className={`flashcard-inner ${flippedCardId === vocabulary.vocabularyID ? "flipped" : ""}`}>
                            <div className="flashcard-front">
                                <h3>{vocabulary.word}</h3>
                                <p>{vocabulary.pronunciation}</p>
                            </div>
                            <div className="flashcard-back">
                                <p>{vocabulary.define}</p>
                                <img
                                    src={vocabulary.imagePath}
                                    alt={vocabulary.word}
                                    className="flashcard-image"
                                />
                                <div className="flashcard-buttons">
                                    <button
                                        onClick={(e) => handleSpeak(vocabulary.word, e)}
                                        className="speak-button"
                                    >
                                       Read
                                    </button>
                                    <button
                                        onClick={(e) => handleAddToLibrary(vocabulary.vocabularyID, e)}
                                        className="add-button"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlashcardPage;

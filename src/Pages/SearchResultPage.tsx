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

const SearchResultPage: React.FC = () => {
    const { word } = useParams<{ word: string }>();
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [flippedCardId, setFlippedCardId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!word) {
            setError("Không có từ khóa tìm kiếm!");
            setLoading(false);
            return;
        }

        axios
            .get("http://localhost:8080/vocabulary/search", { params: { word: word } })
            .then((res) => {
                const data = res.data;
                if (!data) {
                    setVocabularies([]);
                } else if (Array.isArray(data)) {
                    setVocabularies(data);
                } else {
                    // Nếu API trả về 1 object, ta bọc nó thành mảng 1 phần tử
                    setVocabularies([data]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy dữ liệu tìm kiếm:", err);
                setError("Không thể tải dữ liệu tìm kiếm.");
                setLoading(false);
            });
    }, [word]);

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
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = "en-US";
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

        axios
            .post(
                "http://localhost:8080/vocabulary/myLibraryAdd",
                null,
                { params: { userID, vocabularyID } }
            )
            .then((res) => {
                alert(res.data);
            })
            .catch((err) => {
                console.error("Lỗi khi thêm từ vào thư viện:", err);
                alert("Thêm từ thất bại!");
            });
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>{error}</p>;
    if (vocabularies.length === 0) return <p>Không tìm thấy từ vựng nào.</p>;

    return (
        <div className="flashcard-page">
            <h2>Kết quả tìm kiếm: "{word}"</h2>

            <div className="flashcards-container">
                {vocabularies.map((vocab) => (
                    <div
                        key={vocab.vocabularyID}
                        className="flashcard"
                        onClick={() => handleFlip(vocab.vocabularyID)}
                    >
                        <div className={`flashcard-inner ${flippedCardId === vocab.vocabularyID ? "flipped" : ""}`}>
                            <div className="flashcard-front">
                                <h3>{vocab.word}</h3>
                                <p>{vocab.pronunciation}</p>
                            </div>
                            <div className="flashcard-back">
                                <p>{vocab.define}</p>
                                <img src={vocab.imagePath} alt={vocab.word} className="flashcard-image" />
                                <div className="flashcard-buttons">
                                    <button onClick={(e) => handleSpeak(vocab.word, e)} className="speak-button">
                                        Read
                                    </button>
                                    <button onClick={(e) => handleAddToLibrary(vocab.vocabularyID, e)} className="add-button">
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

export default SearchResultPage;

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Question {
    questionID: number;
    questionText: string;
    correctAnswer: string;
    type: string;
}

function getUserIDFromLocalStorage(): number | null {
    const userString = localStorage.getItem("user");
    if (!userString) return null;

    try {
        const user = JSON.parse(userString);
        return user.userID ?? null;
    } catch {
        return null;
    }
}

const QuizFromLibrary: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userID = getUserIDFromLocalStorage();

    useEffect(() => {
        if (!userID) {
            setError("Bạn chưa đăng nhập hoặc thiếu userID.");
            setLoading(false);
            return;
        }

        axios
            .get(`http://localhost:8080/question/fromLibrary?userID=${userID}`)
            .then((res) => {
                setQuestions(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy câu hỏi:", err);
                setError("Không thể tải câu hỏi từ thư viện.");
                setLoading(false);
            });
    }, [userID]);

    const handleSubmit = (answer: string) => {
        if (!userID) return;

        const current = questions[currentIndex];

        axios
            .post(`http://localhost:8080/question/checkAnswer`, null, {
                params: {
                    userID,
                    questionID: current.questionID,
                    userAnswer: answer.trim(),
                },
            })
            .then((res) => {
                const isCorrect = res.data === "correct";

                if (isCorrect) setCorrectCount((c) => c + 1);
                else setIncorrectCount((c) => c + 1);

                if (currentIndex + 1 < questions.length) {
                    setCurrentIndex((i) => i + 1);
                    setUserAnswer("");
                } else {
                    setFinished(true);
                }
            })
            .catch((err) => {
                console.error("Lỗi kiểm tra đáp án:", err);
                alert("Lỗi kiểm tra đáp án, vui lòng thử lại.");
            });
    };

    const handleListen = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    };

    if (loading) return <p>Đang tải câu hỏi...</p>;
    if (error) return <p>{error}</p>;
    if (questions.length === 0) return <p>Không có câu hỏi nào.</p>;
    if (finished) {
        return (
            <div className="quiz-finished">
                <h2>✅ Hoàn thành Quiz</h2>
                <p>Đúng: {correctCount}</p>
                <p>Sai: {incorrectCount}</p>
            </div>
        );
    }

    const current = questions[currentIndex];

    const renderQuestion = () => {
        switch (current.type) {
            case "VI_TO_EN":
            case "FILL_IN_THE_BLANK":
                return (
                    <>
                        <p>
                            <strong>{current.questionText}</strong>
                        </p>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                        />
                        <button onClick={() => handleSubmit(userAnswer)}>Trả lời</button>
                    </>
                );

            case "LISTEN_AND_WRITE":
                return (
                    <>
                        <p>
                            <strong>Nghe và viết từ:</strong>
                        </p>
                        <button onClick={() => handleListen(current.correctAnswer)}>
                            🔊 Nghe
                        </button>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                        />
                        <button onClick={() => handleSubmit(userAnswer)}>Trả lời</button>
                    </>
                );

            case "PRONUNCIATION":
                return (
                    <>
                        <p>
                            <strong>Phát âm đúng từ sau:</strong> {current.questionText}
                        </p>
                        <button onClick={() => handleListen(current.correctAnswer)}>
                            🔊 Nghe lại từ
                        </button>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Nhập phát âm bạn nghe được"
                        />
                        <button onClick={() => handleSubmit(userAnswer)}>Trả lời</button>
                    </>
                );

            default:
                return <p>Loại câu hỏi không được hỗ trợ.</p>;
        }
    };

    return (
        <div className="quiz-page">
            <h2>
                Câu hỏi {currentIndex + 1} / {questions.length}
            </h2>
            <p>
                <em>Loại: {current.type}</em>
            </p>
            {renderQuestion()}
            <hr />
            <p>
                ✅ Đúng: {correctCount} | ❌ Sai: {incorrectCount}
            </p>
        </div>
    );
};

export default QuizFromLibrary;

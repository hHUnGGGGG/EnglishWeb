import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./QuizPage.css";

interface Question {
    questionID: number;
    questionText: string;
    correctAnswer: string;
    type: string;
}

// Hàm lấy userID an toàn từ localStorage
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

const QuizPage: React.FC = () => {
    const { lessonID } = useParams<{ lessonID: string }>();
    const userID = getUserIDFromLocalStorage();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lessonID) return;

        setLoading(true);
        axios
            .get(`http://localhost:8080/question/allByLessonID`, {
                params: { lessonID },
            })
            .then((res) => {
                setQuestions(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi tải câu hỏi:", err);
                setError("Lỗi tải câu hỏi, vui lòng thử lại sau.");
                setLoading(false);
            });
    }, [lessonID]);

    if (!userID) {
        return <p>Vui lòng đăng nhập để làm bài quiz.</p>;
    }

    if (loading) {
        return <p>Đang tải câu hỏi...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (questions.length === 0) {
        return <p>Không có câu hỏi cho bài học này.</p>;
    }

    const current = questions[currentIndex];

    const handleSubmit = (answer: string) => {
        if (!userID) return;

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

    if (finished) {
        return (
            <div className="quiz-finished">
                <h2>✅ Hoàn thành Quiz</h2>
                <p>Đúng: {correctCount}</p>
                <p>Sai: {incorrectCount}</p>
            </div>
        );
    }

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

export default QuizPage;

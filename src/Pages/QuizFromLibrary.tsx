import React, { useEffect, useState } from "react";
import axios from "axios";

interface Question {
    questionID: number;
    questionText: string;
    correctAnswer: string;
    type: string;
}

const QuizFromLibrary: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("Chưa đăng nhập hoặc không có user trong localStorage");
            setLoading(false);
            return;
        }

        try {
            const userObj = JSON.parse(storedUser);
            if (!userObj.userID) {
                alert("Chưa có userID trong thông tin user");
                setLoading(false);
                return;
            }

            // Gọi API backend lấy câu hỏi theo userID
            axios
                .get(`http://localhost:8080/question/fromLibrary?userID=${userObj.userID}`)
                .then((res) => {
                    setQuestions(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Lỗi khi lấy câu hỏi:", err);
                    setLoading(false);
                });
        } catch (error) {
            alert("Dữ liệu user không hợp lệ");
            setLoading(false);
        }
    }, []);

    const handleSubmit = (answer: string) => {
        const current = questions[currentIndex];

        const cleanedAnswer = answer.trim().toLowerCase().replace(/[.,!?]$/, "");
        const cleanedCorrect = current.correctAnswer.trim().toLowerCase();

        const isCorrect = cleanedAnswer === cleanedCorrect;

        if (isCorrect) setCorrectCount((c) => c + 1);
        else setIncorrectCount((c) => c + 1);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex((i) => i + 1);
            setUserAnswer("");
        } else {
            setFinished(true);
        }
    };

    if (loading) return <p>Đang tải câu hỏi...</p>;
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

    return (
        <div className="quiz-page">
            <h2>
                Câu hỏi {currentIndex + 1} / {questions.length}
            </h2>
            <p>
                <em>Loại: {current.type}</em>
            </p>
            <p>
                <strong>{current.questionText}</strong>
            </p>
            <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
            />
            <button onClick={() => handleSubmit(userAnswer)}>Trả lời</button>
            <hr />
            <p>
                ✅ Đúng: {correctCount} | ❌ Sai: {incorrectCount}
            </p>
        </div>
    );
};

export default QuizFromLibrary;

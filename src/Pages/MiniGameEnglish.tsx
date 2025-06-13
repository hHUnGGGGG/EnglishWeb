import React, { useState, useEffect, useRef } from "react";
import "./MiniGameEnglish.css";

interface QuestionModel {
    questionID: number;
    correctAnswer: string;
    questionText: string;
    lessonID: number;
    type: string;
}

const TIME_LIMIT = 20;
const MAX_WRONG = 2;
const QUESTIONS_COUNT = 10;
const API_BASE = "http://localhost:8080/api/game";

const MiniGameEnglish: React.FC = () => {
    const [questions, setQuestions] = useState<QuestionModel[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [score, setScore] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [gameOver, setGameOver] = useState(false);
    const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const getUserID = (): number | null => {
        try {
            const stored = localStorage.getItem("user");
            const user = stored ? JSON.parse(stored) : null;
            return user?.userID ?? null;
        } catch {
            return null;
        }
    };

    const fetchQuestions = () => {
        fetch(`${API_BASE}/random-questions?count=${QUESTIONS_COUNT}`)
            .then(res => res.json())
            .then((data: QuestionModel[]) => {
                setQuestions(data);
                setCurrentIdx(0);
                setUserAnswer("");
                setScore(0);
                setWrongCount(0);
                setTimeLeft(TIME_LIMIT);
                setGameOver(false);
                setAnswersMap({});
            })
            .catch(err => console.error("Lỗi tải câu hỏi:", err));
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (gameOver || questions.length === 0) return;
        if (timeLeft === 0) {
            handleSubmitAnswer();
            return;
        }

        timerRef.current = setTimeout(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timeLeft, gameOver, questions]);

    const updateHighScoreBackend = async (finalScore: number, answers: Record<string, string>) => {
        const userID = getUserID();
        if (!userID) return;

        const payload = {
            userID,
            newScore: finalScore,
            questionAnswers: answers,
        };

        try {
            await fetch(`${API_BASE}/update-score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error("Lỗi gọi API update-score:", err);
        }
    };

    const handleSubmitAnswer = () => {
        if (gameOver) return;
        const currentQuestion = questions[currentIdx];
        if (!currentQuestion) return;

        const trimmedAnswer = userAnswer.trim().toLowerCase();
        const correctAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
        const updatedAnswers = { ...answersMap, [currentQuestion.questionID]: trimmedAnswer };
        setAnswersMap(updatedAnswers);

        const isCorrect = trimmedAnswer === correctAnswer;

        if (isCorrect) {
            setScore((s) => s + 1);
        } else {
            const newWrong = wrongCount + 1;
            setWrongCount(newWrong);
            if (newWrong >= MAX_WRONG) {
                setGameOver(true);
                updateHighScoreBackend(score, updatedAnswers);
                return;
            }
        }

        setUserAnswer("");
        setTimeLeft(TIME_LIMIT);

        if (currentIdx + 1 >= questions.length) {
            const finalScore = score + (isCorrect ? 1 : 0);
            setScore(finalScore);
            setGameOver(true);
            updateHighScoreBackend(finalScore, updatedAnswers);
        } else {
            setCurrentIdx((idx) => idx + 1);
        }
    };

    const currentQuestion = questions[currentIdx];

    return (
        <div className="mini-game-container">
            <div className="mini-game-box">
                {questions.length === 0 ? (
                    <p className="loading">Đang tải câu hỏi...</p>
                ) : gameOver ? (
                    <div className="game-over">
                        <h2>🎮 Game kết thúc!</h2>
                        <p>✅ Điểm của bạn: <strong>{score}</strong></p>
                        <p>❌ Sai: {wrongCount} / {MAX_WRONG}</p>
                        <button onClick={fetchQuestions}>🔁 Chơi lại</button>
                    </div>
                ) : (
                    <>
                        <h3 className="question-header">Câu {currentIdx + 1} / {questions.length}</h3>
                        <p className="question-text">{currentQuestion.questionText}</p>

                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                            placeholder="Nhập câu trả lời..."
                            className="answer-input"
                            autoFocus
                        />

                        <button className="submit-button" onClick={handleSubmitAnswer}>
                            Trả lời
                        </button>

                        <div className="status-info">
                            <p>⏱ Thời gian còn lại: <strong>{timeLeft}s</strong></p>
                            <p>❌ Số lần sai: {wrongCount} / {MAX_WRONG}</p>
                            <p>✅ Điểm: {score}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MiniGameEnglish;

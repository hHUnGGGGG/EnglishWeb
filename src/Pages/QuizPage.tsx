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

const QuizPage: React.FC = () => {
    const { lessonID } = useParams<{ lessonID: string }>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:8080/question/allByLessonID`, {
            params: { lessonID }
        })
            .then(res => setQuestions(res.data))
            .catch(err => console.error("Lỗi tải câu hỏi:", err));
    }, [lessonID]);

    const handleSubmit = (answer: string) => {
        const current = questions[currentIndex];

        // Làm sạch dữ liệu trước khi so sánh
        const cleanedAnswer = answer.trim().toLowerCase().replace(/[.,!?]$/, "");
        const cleanedCorrect = current.correctAnswer.trim().toLowerCase();

        const isCorrect = cleanedAnswer === cleanedCorrect;

        if (isCorrect) setCorrectCount(c => c + 1);
        else setIncorrectCount(c => c + 1);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(i => i + 1);
            setUserAnswer(""); // Reset kết quả
        } else {
            setFinished(true);
        }
    };

    const handleListen = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    };

    const handlePronunciation = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Trình duyệt không hỗ trợ nhận diện giọng nói.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            console.log("Đang nghe...");
        };

        recognition.onresult = (event: any) => {
            const spokenText = event.results[0][0].transcript.trim().toLowerCase().replace(/[.,!?]$/, "");
            setUserAnswer(spokenText); // Gán kết quả đã xử lý
        };

        recognition.onerror = (event: any) => {
            console.error("Lỗi nhận diện giọng nói:", event.error);
        };

        recognition.onend = () => {
            console.log("Dừng nghe...");
        };

        recognition.start();
    };

    if (questions.length === 0) return <p>Đang tải câu hỏi...</p>;

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
                return (
                    <>
                        <p><strong>{current.questionText}</strong></p>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                        />
                        <button onClick={() => handleSubmit(userAnswer)}>Trả lời</button>
                    </>
                );

            case "FILL_IN_THE_BLANK":
                return (
                    <>
                        <p><strong>{current.questionText}</strong></p>
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
                        <p><strong>Nghe và viết từ:</strong></p>
                        <button onClick={() => handleListen(current.correctAnswer)}>🔊 Nghe</button>
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
                        <p><strong>Phát âm đúng từ sau:</strong> {current.questionText}</p>
                        <button
                            onMouseDown={handlePronunciation}
                            onTouchStart={handlePronunciation}
                        >
                            🎤 Nhấn giữ để nói
                        </button>
                        <button onClick={() => handleListen(current.correctAnswer)}>
                            🔊 Nghe lại từ
                        </button>
                        <p><strong>Phát âm của bạn:</strong> {userAnswer}</p>
                        <button onClick={() => handleSubmit(userAnswer)}>Trả lời</button>
                    </>
                );

            default:
                return <p>Loại câu hỏi không được hỗ trợ.</p>;
        }
    };

    return (
        <div className="quiz-page">
            <h2>Câu hỏi {currentIndex + 1} / {questions.length}</h2>
            <p><em>Loại: {current.type}</em></p>
            {renderQuestion()}
            <hr />
            <p>✅ Đúng: {correctCount} | ❌ Sai: {incorrectCount}</p>
        </div>
    );
};

export default QuizPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LessonPage.css"; // Thêm file CSS riêng

interface Lesson {
    lessonID: number;
    title: string;
    topicID: number;
    imagePath: string; // 🔥 Thêm imagePath
}

const LessonPage: React.FC = () => {
    const { topicID } = useParams<{ topicID: string }>();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!topicID) {
            setError("Không tìm thấy topicID!");
            setLoading(false);
            return;
        }

        axios.get(`http://localhost:8080/lessons/${topicID}`)
            .then(response => {
                setLessons(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi lấy danh sách bài học:", error);
                setError("Không thể tải danh sách bài học.");
                setLoading(false);
            });
    }, [topicID]);

    const handleLessonClick = (lessonID: number) => {
        navigate(`/flashcards/${lessonID}`);
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="lesson-page">
            <h2>Danh sách bài học</h2>
            <div className="lessons-container">
                {lessons.map((lesson) => (
                    <button
                        key={lesson.lessonID}
                        className="lesson-button"
                        onClick={() => handleLessonClick(lesson.lessonID)}
                    >
                        <img
                            src={lesson.imagePath}
                            alt={lesson.title}
                            className="lesson-image"
                        />
                        <p>{lesson.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LessonPage;

import React, { useState, useEffect } from "react";
import axios from "axios";

interface Topic {
    topicID: number;
    title: string;
    imagePath: string;
}

interface Lesson {
    lessonID: number;
    title: string;
}

const AdminPage: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<number | "">("");
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<number | "">("");
    const [selectedMode, setSelectedMode] = useState<string>("");

    useEffect(() => {
        axios
            .get("http://localhost:8080/topics/getAllTopics")
            .then((response) => setTopics(response.data))
            .catch(() => alert("Lỗi khi tải topics"));
    }, []);

    useEffect(() => {
        if (selectedTopic !== "" && selectedTopic !== null) {
            axios
                .get(`http://localhost:8080/lessons/${selectedTopic}`)
                .then((response) => setLessons(response.data))
                .catch(() => alert("Lỗi khi tải lessons"));
        } else {
            setLessons([]);
            setSelectedLesson("");
            setSelectedMode("");
        }
    }, [selectedTopic]);

    const handleCreateContent = async () => {
        if (!selectedLesson) {
            alert("Bạn phải chọn một bài học!");
            return;
        }
        if (!selectedMode) {
            alert("Bạn phải chọn chế độ tạo nội dung!");
            return;
        }

        try {
            if (selectedMode === "question") {
                const questionTypes = [
                    "VI_TO_EN",
                    "FILL_IN_THE_BLANK",
                    "LISTEN_AND_WRITE",
                    "PRONUNCIATION",
                ];
                for (const type of questionTypes) {
                    await axios.post(
                        `http://localhost:8080/question/generate`,
                        null,
                        {
                            params: {
                                lessonID: selectedLesson,
                                type,
                            },
                        }
                    );
                }
                alert("Tạo tất cả các loại câu hỏi thành công!");
            } else if (selectedMode === "vocabulary") {
                await axios.post(
                    `http://localhost:8080/vocabulary/generate`,
                    null,
                    {
                        params: {
                            lessonID: selectedLesson,
                        },
                    }
                );
                alert("Tạo từ vựng thành công!");
            }
        } catch (error) {
            console.error("Lỗi tạo nội dung:", error);
            alert("Tạo nội dung thất bại!");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Admin - Tạo nội dung tự động</h2>

            <div>
                <h3>Chọn Chủ đề:</h3>
                <select
                    value={selectedTopic}
                    onChange={(e) => {
                        setSelectedTopic(e.target.value ? Number(e.target.value) : "");
                        setSelectedLesson("");
                        setSelectedMode("");
                    }}
                >
                    <option value="">-- Chọn Topic --</option>
                    {topics.map((topic) => (
                        <option key={topic.topicID} value={topic.topicID}>
                            {topic.title}
                        </option>
                    ))}
                </select>
            </div>

            {lessons.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Chọn Bài học:</h3>
                    <select
                        value={selectedLesson}
                        onChange={(e) => {
                            setSelectedLesson(e.target.value ? Number(e.target.value) : "");
                            setSelectedMode("");
                        }}
                    >
                        <option value="">-- Chọn Lesson --</option>
                        {lessons.map((lesson) => (
                            <option key={lesson.lessonID} value={lesson.lessonID}>
                                {lesson.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedLesson && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Bạn muốn tạo nội dung gì?</h3>
                    <select
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                    >
                        <option value="">-- Chọn chế độ --</option>
                        <option value="question">Tạo câu hỏi</option>
                        <option value="vocabulary">Tạo từ vựng</option>
                    </select>
                </div>
            )}

            {selectedLesson && selectedMode && (
                <div style={{ marginTop: "30px" }}>
                    <button onClick={handleCreateContent}>
                        Tạo nội dung cho bài học này
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminPage;

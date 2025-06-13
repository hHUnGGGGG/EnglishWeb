import React, { useEffect, useState } from "react";
import axios from "axios";

interface TopicModel {
    topicID: number;
    title: string;
    imagePath: string;
}

interface LessonModel {
    lessonID: number;
    title: string;
    topicID: number;
    imagePath: string;
}

interface VocabularyModel {
    vocabularyID: number;
    word: string;
    define: string;
    lessonID: number;
    imagePath: string;
    pronunciation: string;
}

const AdminPageManual: React.FC = () => {
    const [topics, setTopics] = useState<TopicModel[]>([]);
    const [lessons, setLessons] = useState<LessonModel[]>([]);
    const [vocabularies, setVocabularies] = useState<VocabularyModel[]>([]);

    const [selectedTopicID, setSelectedTopicID] = useState<number | null>(null);
    const [selectedLessonID, setSelectedLessonID] = useState<number | null>(null);

    // Input states cho Topic
    const [newTopicTitle, setNewTopicTitle] = useState<string>("");
    const [newTopicImagePath, setNewTopicImagePath] = useState<string>("");

    // Input states cho Lesson
    const [newLessonTitle, setNewLessonTitle] = useState<string>("");
    const [newLessonImagePath, setNewLessonImagePath] = useState<string>("");

    // Vocabulary input cho add/edit
    const [newVocabWord, setNewVocabWord] = useState<string>("");
    const [newVocabDefine, setNewVocabDefine] = useState<string>("");
    const [newVocabPronunciation, setNewVocabPronunciation] = useState<string>("");
    const [newVocabImagePath, setNewVocabImagePath] = useState<string>("");

    const [editingVocabID, setEditingVocabID] = useState<number | null>(null);

    // Load all topics on mount
    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = () => {
        axios
            .get("http://localhost:8080/topics/getAllTopics")
            .then((res) => setTopics(res.data))
            .catch((err) => console.error("Lỗi khi lấy topic:", err));
    };

    const fetchLessons = (topicID: number) => {
        axios
            .get(`http://localhost:8080/lessons/${topicID}`)
            .then((res) => setLessons(res.data))
            .catch((err) => console.error("Lỗi khi lấy lessons:", err));
    };

    const fetchVocabularies = (lessonID: number) => {
        axios
            .get(`http://localhost:8080/vocabulary/allByLessonID?lessonID=${lessonID}`)
            .then((res) => setVocabularies(res.data))
            .catch((err) => console.error("Lỗi khi lấy vocabularies:", err));
    };

    // Handle selecting topic: load lessons and reset states
    const handleSelectTopic = (topic: TopicModel) => {
        setSelectedTopicID(topic.topicID);
        setSelectedLessonID(null);
        setLessons([]);
        setVocabularies([]);
        fetchLessons(topic.topicID);
    };

    // Handle selecting lesson: load vocabularies
    const handleSelectLesson = (lesson: LessonModel) => {
        setSelectedLessonID(lesson.lessonID);
        fetchVocabularies(lesson.lessonID);
        resetVocabForm();
    };

    // Reset vocabulary add/edit form
    const resetVocabForm = () => {
        setNewVocabWord("");
        setNewVocabDefine("");
        setNewVocabPronunciation("");
        setNewVocabImagePath("");
        setEditingVocabID(null);
    };

    // --- Thêm Topic ---
    const handleAddTopic = () => {
        if (!newTopicTitle.trim()) return alert("Vui lòng nhập tiêu đề!");

        axios
            .post("http://localhost:8080/topics", {
                title: newTopicTitle,
                imagePath: newTopicImagePath.trim(),
            })
            .then(() => {
                setNewTopicTitle("");
                setNewTopicImagePath("");
                fetchTopics();
            })
            .catch((err) => console.error("Lỗi khi thêm topic:", err));
    };

    // --- Xóa Topic ---
    const handleDeleteTopic = (topicID: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa Topic này?")) return;

        axios
            .delete(`http://localhost:8080/topics/${topicID}`)
            .then(() => {
                if (selectedTopicID === topicID) {
                    setSelectedTopicID(null);
                    setSelectedLessonID(null);
                    setLessons([]);
                    setVocabularies([]);
                }
                fetchTopics();
            })
            .catch((err) => console.error("Lỗi khi xóa topic:", err));
    };

    // --- Thêm Lesson ---
    const handleAddLesson = () => {
        if (!newLessonTitle.trim()) return alert("Vui lòng nhập tiêu đề Lesson!");
        if (selectedTopicID === null) return alert("Vui lòng chọn Topic trước!");

        axios
            .post("http://localhost:8080/lessons/add", {
                title: newLessonTitle,
                topicID: selectedTopicID,
                imagePath: newLessonImagePath.trim(),
            })
            .then(() => {
                setNewLessonTitle("");
                setNewLessonImagePath("");
                fetchLessons(selectedTopicID);
            })
            .catch((err) => console.error("Lỗi khi thêm lesson:", err));
    };

    // --- Xóa Lesson ---
    const handleDeleteLesson = (lessonID: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa Lesson này?")) return;

        axios
            .delete(`http://localhost:8080/lessons/${lessonID}`)
            .then(() => {
                if (selectedLessonID === lessonID) {
                    setSelectedLessonID(null);
                    setVocabularies([]);
                }
                if (selectedTopicID !== null) fetchLessons(selectedTopicID);
            })
            .catch((err) => console.error("Lỗi khi xóa lesson:", err));
    };

    // --- Thêm hoặc Sửa Vocabulary ---
    const handleAddOrEditVocab = () => {
        if (!newVocabWord.trim() || !newVocabDefine.trim()) {
            return alert("Vui lòng nhập đủ từ và nghĩa!");
        }
        if (selectedLessonID === null) {
            return alert("Vui lòng chọn Lesson trước!");
        }

        const data = {
            word: newVocabWord,
            define: newVocabDefine,
            pronunciation: newVocabPronunciation.trim(),
            lessonID: selectedLessonID,
            imagePath: newVocabImagePath.trim(),
        };

        if (editingVocabID === null) {
            // Thêm mới
            axios
                .post("http://localhost:8080/vocabulary/add", data)
                .then(() => {
                    resetVocabForm();
                    fetchVocabularies(selectedLessonID);
                })
                .catch((err) => console.error("Lỗi khi thêm vocabulary:", err));
        } else {
            // Sửa vocabulary
            axios
                .put(`http://localhost:8080/vocabulary/${editingVocabID}`, data)
                .then(() => {
                    resetVocabForm();
                    fetchVocabularies(selectedLessonID);
                })
                .catch((err) => console.error("Lỗi khi sửa vocabulary:", err));
        }
    };

    // --- Chuẩn bị sửa vocabulary ---
    const handleEditVocab = (vocab: VocabularyModel) => {
        setEditingVocabID(vocab.vocabularyID);
        setNewVocabWord(vocab.word);
        setNewVocabDefine(vocab.define);
        setNewVocabPronunciation(vocab.pronunciation);
        setNewVocabImagePath(vocab.imagePath);
    };

    // --- Xóa Vocabulary ---
    const handleDeleteVocab = (vocabID: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa từ vựng này?")) return;
        axios
            .delete(`http://localhost:8080/vocabulary/${vocabID}`)
            .then(() => {
                if (selectedLessonID !== null) fetchVocabularies(selectedLessonID);
            })
            .catch((err) => console.error("Lỗi khi xóa vocabulary:", err));
    };

    // Lấy tiêu đề của topic đang chọn (để hiển thị)
    const selectedTopicTitle = topics.find(t => t.topicID === selectedTopicID)?.title || "";

    // Lấy tiêu đề của lesson đang chọn (để hiển thị)
    const selectedLessonTitle = lessons.find(l => l.lessonID === selectedLessonID)?.title || "";

    return (
        <div style={{ padding: 20 }}>
            <h2>🔧 Chỉnh sửa nội dung thủ công</h2>

            {/* Thêm Topic */}
            <div>
                <input
                    type="text"
                    placeholder="Nhập tiêu đề topic"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Nhập đường dẫn ảnh Topic (imagePath)"
                    value={newTopicImagePath}
                    onChange={(e) => setNewTopicImagePath(e.target.value)}
                    style={{ marginLeft: 10 }}
                />
                <button onClick={handleAddTopic} style={{ marginLeft: 10 }}>
                    Thêm Topic
                </button>
            </div>

            {/* Danh sách Topic với nút xóa */}
            <h3>📚 Danh sách Topic</h3>
            <ul>
                {topics.map((topic) => (
                    <li key={topic.topicID}>
                        <button onClick={() => handleSelectTopic(topic)}>{topic.title}</button>{" "}
                        <button
                            style={{ color: "red" }}
                            onClick={() => handleDeleteTopic(topic.topicID)}
                        >
                            Xóa
                        </button>
                    </li>
                ))}
            </ul>

            {/* Danh sách Lesson và thêm Lesson */}
            {selectedTopicID !== null && (
                <>
                    <h3>📘 Danh sách Lesson (Topic: <em>{selectedTopicTitle}</em>)</h3>
                    <ul>
                        {lessons.map((lesson) => (
                            <li key={lesson.lessonID}>
                                <button onClick={() => handleSelectLesson(lesson)}>{lesson.title}</button>{" "}
                                <button
                                    style={{ color: "red" }}
                                    onClick={() => handleDeleteLesson(lesson.lessonID)}
                                >
                                    Xóa
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Form thêm Lesson */}
                    <div style={{ marginTop: 10 }}>
                        <input
                            type="text"
                            placeholder="Nhập tiêu đề Lesson mới"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Nhập đường dẫn ảnh Lesson (imagePath)"
                            value={newLessonImagePath}
                            onChange={(e) => setNewLessonImagePath(e.target.value)}
                            style={{ marginLeft: 10 }}
                        />
                        <button onClick={handleAddLesson} style={{ marginLeft: 10 }}>
                            Thêm Lesson
                        </button>
                    </div>
                </>
            )}

            {/* Danh sách Vocabulary và form thêm/sửa vocabulary */}
            {selectedLessonID !== null && (
                <>
                    <h3>📗 Danh sách Vocabulary (Lesson: <em>{selectedLessonTitle}</em>)</h3>
                    <ul>
                        {vocabularies.map((vocab) => (
                            <li key={vocab.vocabularyID}>
                                <strong>{vocab.word}</strong>: {vocab.define} (Phát âm: {vocab.pronunciation || "N/A"})
                                {" "}
                                <button onClick={() => handleEditVocab(vocab)}>Sửa</button>
                                <button
                                    style={{ color: "red" }}
                                    onClick={() => handleDeleteVocab(vocab.vocabularyID)}
                                >
                                    Xóa
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Form Thêm / Sửa Vocabulary */}
                    <div style={{ marginTop: 10 }}>
                        <input
                            type="text"
                            placeholder="Từ vựng"
                            value={newVocabWord}
                            onChange={(e) => setNewVocabWord(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Nghĩa"
                            value={newVocabDefine}
                            onChange={(e) => setNewVocabDefine(e.target.value)}
                            style={{ marginLeft: 10 }}
                        />
                        <input
                            type="text"
                            placeholder="Phát âm"
                            value={newVocabPronunciation}
                            onChange={(e) => setNewVocabPronunciation(e.target.value)}
                            style={{ marginLeft: 10 }}
                        />
                        <input
                            type="text"
                            placeholder="Đường dẫn ảnh"
                            value={newVocabImagePath}
                            onChange={(e) => setNewVocabImagePath(e.target.value)}
                            style={{ marginLeft: 10 }}
                        />
                        <button onClick={handleAddOrEditVocab} style={{ marginLeft: 10 }}>
                            {editingVocabID === null ? "Thêm Vocabulary" : "Cập nhật Vocabulary"}
                        </button>
                        {editingVocabID !== null && (
                            <button
                                onClick={resetVocabForm}
                                style={{ marginLeft: 10, backgroundColor: "lightgray" }}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminPageManual;

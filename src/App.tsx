import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Dashboard from "./Pages/DashBoard";
import Login from "./component/Login"
import Register from "./component/Register";
import LessonPage from "./Pages/LessonPage";
import FlashcardPage from "./Pages/FlashcardPage";
import MyLibrary from "./Pages/MyLibrary";
import AdminPage from "./Pages/AdminPage";
import QuizPage from "./Pages/QuizPage";
import SearchResultPage from "./Pages/SearchResultPage";
import QuizFromLibrary from "./Pages/QuizFromLibrary";
import AdminPageAuto from "./Pages/AdminPageAuto";
import AdminPageManual from "./Pages/AdminPageManual";
import LibraryStatistics from "./Pages/LibraryStatistics";
import LeaderboardPage from "./Pages/LeaderboardPage";
import MiniGameEnglish from "./Pages/MiniGameEnglish";
const App: React.FC = () => {
    // @ts-ignore
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lessons/:topicID" element={<LessonPage />} />
                <Route path="/flashcards/:lessonID" element={<FlashcardPage />} />
                <Route path="/myLibrary" element={<MyLibrary />} />
                <Route path={"/admin"} element={<AdminPage />} />
                <Route path="/quiz/:lessonID" element={<QuizPage />} />
                <Route path="/search/:word" element={<SearchResultPage />} />
                <Route path="/quiz/mylibrary" element={<QuizFromLibrary />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/auto" element={<AdminPageAuto />} />
                <Route path="/admin/manual" element={<AdminPageManual />} />
                <Route path="/libraryStatistics" element={<LibraryStatistics />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/miniGame" element={<MiniGameEnglish />} />
            </Routes>
        </Router>
    );
};

export default App;
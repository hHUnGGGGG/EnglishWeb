import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import "./Home.css";
import avatarGif from "../resource/image/image-removebg-preview (1).png";
import img1 from "../resource/image/img_1.png";
import img2 from "../resource/image/img_2.png";
import img3 from "../resource/image/img_3.png";
import img4 from "../resource/image/img_4.png";

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [flippedCardId, setFlippedCardId] = useState<number | null>(null);
    const [scrollY, setScrollY] = useState(0);
    const [prevScrollY, setPrevScrollY] = useState(0);
    const [img4Position, setImg4Position] = useState(-700);
    const featureBlockRef = useRef<HTMLDivElement>(null);

    // Animation configuration
    const MAX_LEFT = -550;  // Maximum left movement in pixels
    const MAX_RIGHT = 350;  // Maximum right movement in pixels
    const SCROLL_SENSITIVITY = 0.5; // Movement speed factor
    const ANIMATION_THROTTLE = 50; // Milliseconds between updates

    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: false,
            mirror: false
        });

        let lastUpdate = 0;
        let animationFrameId: number;

        const handleScroll = () => {
            const now = Date.now();
            if (now - lastUpdate < ANIMATION_THROTTLE) return;
            lastUpdate = now;

            const currentScrollY = window.scrollY;
            const scrollDirection = currentScrollY > prevScrollY ? 'down' : 'up';
            setPrevScrollY(currentScrollY);
            setScrollY(currentScrollY);

            if (featureBlockRef.current) {
                const rect = featureBlockRef.current.getBoundingClientRect();
                const isInView = rect.top < window.innerHeight && rect.bottom >= 0;

                if (isInView) {
                    const scrollDelta = Math.abs(currentScrollY - prevScrollY);
                    const positionDelta = scrollDelta * SCROLL_SENSITIVITY;

                    setImg4Position(prev => {
                        let newPosition = prev;

                        if (scrollDirection === 'down') {
                            newPosition = Math.min(prev + positionDelta, MAX_RIGHT);
                        } else {
                            newPosition = Math.max(prev - positionDelta, MAX_LEFT);
                        }

                        return newPosition;
                    });
                }
            }
        };

        const throttledScroll = () => {
            animationFrameId = requestAnimationFrame(handleScroll);
        };

        window.addEventListener('scroll', throttledScroll);
        return () => {
            window.removeEventListener('scroll', throttledScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, [prevScrollY]);

    // Sample flashcard data
    const sampleFlashcards = [
        {
            id: 1,
            word: "",
            pronunciation: "",
            definition: "",
            image: "",
            position: {
                transform: "translateX(-100px) translateY(-130px)",
                zIndex: 1
            },
            rotation: -50,
            flashcardImage: img1
        },
        {
            id: 2,
            word: "",
            pronunciation: "",
            definition: "",
            image: "",
            position: {
                transform: "translateX(0px) translateY(-20px)",
                zIndex: 1
            },
            rotation: -2,
            flashcardImage: img2
        },
        {
            id: 3,
            word: "",
            pronunciation: "",
            definition: "",
            image: "",
            position: {
                transform: "translateX(100px) translateY(-130px)",
                zIndex: 1
            },
            rotation: 40,
            flashcardImage: img3
        }
    ];

    const handleFlip = (cardId: number) => {
        setFlippedCardId(flippedCardId === cardId ? null : cardId);
    };

    return (
        <div className="homePage">
            <header className="fixed-header">
                <div className="header-content">
                    <h1 className="home-title">Phần mềm học từ vựng số 1 làng tôi</h1>
                    <div className="buttons-container">
                        <div className="button-container">
                            <div className="button-bg"></div>
                            <button className="home_button" onClick={() => navigate("/login")}>Đăng Nhập</button>
                        </div>
                        <div className="button-container">
                            <div className="button-bg"></div>
                            <button className="home_button" onClick={() => navigate("/register")}>Đăng Ký</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="content-section">
                <div className="features-container">
                    {/* Feature 1 - Flashcard Section */}
                    <div className="feature-block white" data-aos="fade-up">
                        <div className="home-text black">
                            <h3>Học từ vựng qua thẻ ghi nhớ</h3>
                        </div>
                        <div className="feature-content black">
                            <p>Hệ thống ghi nhớ từ vựng dưới dạng thẻ kèm theo hình ảnh minh họa sống động</p>

                            {/* Flashcardd Container */}
                            <div className="flashcardds-container">
                                {sampleFlashcards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="flashcardd"
                                        onClick={() => handleFlip(card.id)}
                                        style={{
                                            transform: `rotateZ(${card.rotation}deg) ${card.position.transform || ''}`,
                                            transformOrigin: 'center',
                                            ...((({ transform, ...rest }) => rest)(card.position))
                                        }}
                                    >
                                        <div className={`flashcardd-inner ${flippedCardId === card.id ? "flipped" : ""}`}>
                                            <div className="flashcardd-front">
                                                <img
                                                    src={card.flashcardImage}
                                                    alt={card.word}
                                                    className="flashcardd-front-image"
                                                />
                                                <h3>{card.word}</h3>
                                                <p>{card.pronunciation}</p>
                                            </div>
                                            <div className="flashcardd-back">
                                                <p>{card.definition}</p>
                                                <img
                                                    src={avatarGif}
                                                    className="flashcardd-image"
                                                    alt="luffy"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 - Animated Image Section */}
                    <div className="feature-block black" data-aos="fade-up" data-aos-delay="100" ref={featureBlockRef}>
                        <div className="home-text white">
                            <h3>Học từ vựng hiệu quả</h3>
                        </div>
                        <div className="feature-content white">
                            <p>Hệ thống câu hỏi đa dạng giúp bạn ghi nhớ từ một cách nhanh chóng</p>
                        </div>
                        <div className="feature-image-container">
                            <img
                                src={img4}
                                alt="Học từ vựng hiệu quả"
                                loading="lazy"
                                className="scroll-animated-image"
                                style={{
                                    transform: `translateX(${img4Position}px)`
                                }}
                            />
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="feature-block white" data-aos="fade-up" data-aos-delay="200">
                        <div className="home-text black">
                            <h3>Xây dựng thư viện từ của riêng mình</h3>
                        </div>
                        <div className="feature-content black">
                            <p>Bạn có thể chọn tìm kiếm những từ để thêm vào thư viện thẻ của mình. Đồng thời còn có phần kiểm tra để giúp bạn ghi nhớ những từ đó</p>
                        </div>
                        <div className="feature-image">
                            <img
                                src={avatarGif}
                                alt="Thư viện từ vựng cá nhân"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Feature 4 */}
                    <div className="feature-block black" data-aos="fade-up" data-aos-delay="300">
                        <div className="home-text white">
                            <h3>Hơn 1000 bài học</h3>
                        </div>
                        <div className="feature-content white">
                            <p>Đa dạng chủ đề từ cơ bản đến nâng cao</p>
                        </div>
                        <div className="feature-image">
                            <img
                                src={avatarGif}
                                alt="1000+ bài học tiếng Anh"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
                <div style={{ height: "500px" }}></div>
            </main>
        </div>
    );
};

export default Home;
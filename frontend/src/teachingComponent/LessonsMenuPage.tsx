import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { subscribeAuth } from "../auth";
import { getLessonBestScores, getUserProgress } from "../data/lessonProgression";

const LessonMenuPage: React.FC = () =>{
    const [guidePopup, setGuidePopUp] = useState(false);
    const [showDetails, setShowDetails] = useState<number | null>(null);
    const [highestLevelPassed, setHighestLevelPassed] = useState<number>(-1);
    const navigate = useNavigate();
    const location = useLocation();

    //test highest score function
    useEffect(() => {
    if (location.state?.lessonIndex !== undefined) {
        setLessonBestScores(prev => ({
            ...prev,
            [location.state.lessonIndex]: Math.max(
                prev[location.state.lessonIndex] ?? 0,
                location.state.score
            ),
        }));
    }
}, [location.state]);


    const loadProgress = async (user: any) => {
        if (user) {
            try {
                const progress = await getUserProgress(user.uid);
                console.log(`[Lessons Page] Loaded progress: highestLevelPassed = ${progress}`, {
                    userId: user.uid,
                    meaning: progress === -1 
                        ? "No lessons passed yet (new user or no database record)" 
                        : `Passed lesson ${progress + 1} (should unlock lesson ${progress + 2})`
                });
                setHighestLevelPassed(progress);

                // Load best quiz scores (persisted in Firestore)
                const best = await getLessonBestScores(user.uid);
                setLessonBestScores(best);
            } catch (error) {
                console.error("Error loading user progress:", error);
                setHighestLevelPassed(-1);
                setLessonBestScores({});
            }
        } else {
            // Not logged in - no progression
            console.log("[Lessons Page] User not logged in, no progression");
            setHighestLevelPassed(-1);
            setLessonBestScores({});
        }
    };

    useEffect(() => {
        const unsub = subscribeAuth((user) => {
            loadProgress(user);
        });
        
        return () => unsub();
    }, []);

    // Reload progression when navigating back to this page
    useEffect(() => {
        if (location.pathname === "/lessons") {
            // Reload after a short delay to ensure database write completed
            const timer = setTimeout(() => {
                subscribeAuth((user) => {
                    if (user) {
                        loadProgress(user);
                    }
                })();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [location.pathname]);
    

    const handleClick = (index: number) => {
        setShowDetails(prev => (prev === index ? null : index));
    };

    //Show highest score 
    const [lessonBestScores, setLessonBestScores] =
  useState<Record<number, number>>({});

    const levels: string[][] = [
        ["01  |  Core Basics","core-basics"],
        ["02  |  Minor Essentials","minor-essentials"],
        ["03  |  Chord Inversions","chord-inversions"],
        ["04  |  Extended Harmony", "extended-harmony"],
        ["05  |  Modal Colors","modal-colors"],
        ["06  |  Musical Analysis","musical-analysis"]
    ];
    
    const details : string[][] = [
        ["Major triads","Major scales","I–IV–V basics","This level introduces the essential building blocks of music. Students learn major triads, the most common major scales, and simple I–IV–V progressions that appear in almost every genre. The goal is to build basic hand coordination and help learners recognize how chords move in predictable patterns."],
        ["Minor triads","Natural minor scales","i–V–i patterns","Here we expand into the minor sound world. Students practice minor triads, the natural minor scale, and basic i–V–i progressions that define minor-key harmony. This level helps learners hear emotional contrast between major and minor and strengthens left-hand chord control."],
        ["Root/1st/2nd inversions","Intermediate scales","I–vi–IV–V","Students now explore inversions, a core technique for smooth transitions between chords. This level covers root position, first inversion, and second inversion, along with intermediate-level scales and the popular I–vi–IV–V progression. The focus is on improving hand movement and making chords flow naturally."],
        ["7th chords","ii–V–I","Harmonizing scales","At this stage, students begin adding color to their playing. They learn 7th chords, study the important ii–V–I progression, and practice harmonizing scales to understand how chords are built beyond triads. This introduces jazz, pop, and more advanced classical harmonies."],
        ["Dorian","Mixolydian","Mode-based progressions","Students discover modal sounds such as Dorian and Mixolydian, which are often used in improvisation, pop, and modern music. They learn how to build mode-based progressions and experiment with alternative tonal flavors beyond major/minor. This level focuses on creativity and ear development."],
        ["Identify key","Read progression","Analyze AI-generated pieces","Finally, students learn how to understand music structurally. They identify the key, determine the chord progression, and analyze the overall pattern of AI-generated pieces. The aim is to connect theory with real music, giving students the ability to recognize what they hear and play with intention."]
    ];
    
    const goToCourse = (index: number) => {
        navigate(`/${levels[index][1]}`);
    };

    return (
        <div className="modern-container">
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="modern-title" style={{ margin: 0 }}>Music Academy</h1>
                    <div 
                        onClick={() => setGuidePopUp(true)}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            padding: '10px', 
                            borderRadius: '12px', 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', display: 'block' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {levels.map(([title], index) => {
                        const isOpen = showDetails === index;
                        const isUnlocked = index === 0 || index <= highestLevelPassed + 1;

                        return (
                            <div 
                                key={title} 
                                className={`lesson-card ${isUnlocked ? "unlocked" : "locked"}`}
                            >
                                <div 
                                    className="lesson-header"
                                    onClick={() => isUnlocked && handleClick(index)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '8px', 
                                            background: isUnlocked ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                            color: isUnlocked ? '#60a5fa' : '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <span className="lesson-title-text">{title.split('|')[1]?.trim() || title}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {!isUnlocked && (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                            </svg>
                                        )}
                                        {isUnlocked && (
                                            <svg 
                                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}
                                            >
                                                <path d="M6 9l6 6 6-6"/>
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                <div style={{ 
                                    maxHeight: isOpen ? '500px' : '0', 
                                    overflow: 'hidden', 
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: "flex", flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                                            <div className="topic-tag">{details[index][0]}</div>
                                            <div className="topic-tag">{details[index][1]}</div>
                                            <div className="topic-tag">{details[index][2]}</div>
                                        </div>

                                        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                            {details[index][3]}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ 
                                                padding: "8px 16px",
                                                background: "rgba(255,255,255,0.05)",
                                                borderRadius: "10px",
                                                fontSize: "0.85rem",
                                                color: '#e2e8f0',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {lessonBestScores[index] !== undefined ? (
                                                    <span><strong>Best:</strong> {lessonBestScores[index]}%</span>
                                                ) : (
                                                    <span style={{ opacity: 0.5 }}>Not attempted</span>
                                                )}
                                            </div>

                                            <button 
                                                className="start-btn" 
                                                onClick={() => goToCourse(index)}
                                                disabled={!isUnlocked}
                                            >
                                                Start Lesson
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Simple Modern Modal */}
            {guidePopup && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ maxWidth: '500px', position: 'relative' }}>
                        <h2 className="modern-title" style={{ fontSize: '1.8rem' }}>How it Works</h2>
                        <ul style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '20px' }}>
                            <li>Complete lessons to unlock the next level.</li>
                            <li>Each lesson focuses on specific music theory concepts.</li>
                            <li>Pass the quiz at the end of each lesson to progress.</li>
                            <li>Your highest score will be tracked for each lesson.</li>
                        </ul>
                        <button 
                            className="start-btn" 
                            style={{ width: '100%', marginTop: '1rem' }}
                            onClick={() => setGuidePopUp(false)}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonMenuPage;
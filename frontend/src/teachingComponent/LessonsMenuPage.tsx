import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { subscribeAuth } from "../auth";
import { getUserProgress } from "../data/lessonProgression";

const LessonMenuPage: React.FC = () =>{
    const [guidePopup, setGuidePopUp] = useState(false);
    const [showDetails, setShowDetails] = useState<number | null>(null);
    const [highestLevelPassed, setHighestLevelPassed] = useState<number>(-1);
    const navigate = useNavigate();
    const location = useLocation();

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
            } catch (error) {
                console.error("Error loading user progress:", error);
                setHighestLevelPassed(-1);
            }
        } else {
            // Not logged in - no progression
            console.log("[Lessons Page] User not logged in, no progression");
            setHighestLevelPassed(-1);
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
        <div className="teaching-page-container">
            <div>
                <div className="nav-elim-bottom3">
                    <h1 style={{fontSize:"3rem", margin:"0"}}>Lessons</h1>
                    <div onClick={() => setGuidePopUp(true)}>
                        <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '1.2rem 0 0 0.5rem'}} />
                    </div>
                </div>
                <div className="card-container elimtop" style={{margin:0, padding:"1rem 10rem"}}>
                    {levels.map(([title], index) => {
                        const isOpen = showDetails === index;
                        // Lesson 1 (index 0) is always unlocked                      
                        const isUnlocked = index === 0 || index <= highestLevelPassed + 1;

                        return (
                            <div key={title}>
                            <div
                                className="lesson-titles"
                                onClick={() => {
                                    if (!isUnlocked) return;
                                    handleClick(index)}}
                                style={!isUnlocked?{backgroundColor:"var(--primary-color)", color:"#ffffff40", cursor:"default"}:{backgroundColor:"var(--primary-color)", cursor:"pointer"}}
                            >
                                {title}
                            </div>

                            <div className={`lesson-details ${isOpen ? "slide" : ""}`}>
                                <div style={{ display: "flex" }}>
                                <h3>Topics:</h3>
                                <div className="label">{details[index][0]}</div>
                                <div className="label">{details[index][1]}</div>
                                <div className="label">{details[index][2]}</div>
                                </div>

                                <p>{details[index][3]}</p>

                                <button 
                                    className="playbtn" 
                                    style={{ width: "5rem", justifySelf:"flex-end", opacity: isUnlocked ? 1 : 0.5, cursor: isUnlocked ? "pointer" : "not-allowed" }} 
                                    onClick={() => isUnlocked && goToCourse(index)}
                                    disabled={!isUnlocked}
                                >
                                Start
                                </button>
                            </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

};

export default LessonMenuPage;
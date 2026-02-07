import React,{ useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import questions from "./subComponent/QuestionList.json"
import { subscribeAuth } from "../auth";
import { updateUserProgress } from "../data/lessonProgression";
import PianoRollAnswer from "./subComponent/PianoRollAnswer";

export type RawQuestion = {
  question: string;
  choices: string[];
  correct: number;
  type?: "piano_roll" | "choice";
  correctNotes?: string[];
};

export type LevelData = {
  level_number: number;
  level_name: string;
  questions: RawQuestion[];
};

const QuestionPage: React.FC = () => {
    const navigate = useNavigate();

    const [currentQ, setCurrentQ] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    
    const { level } = useParams<{ level: string }>();
    const levelNumber = Number(level);
    const levelData = (questions as LevelData[]).find(
        l => l.level_number === levelNumber
    );
    
    useEffect(() => {
        const unsub = subscribeAuth((user) => {
            setUserId(user?.uid ?? null);
        });
        return () => unsub();
    }, []);
    
    if (!levelData) {
        return <p>Level not found</p>;
    }
    
    const q = levelData.questions[currentQ];  
    const totalQuestions = levelData.questions.length;

    const [answers, setAnswers] = useState<(number | string[] | null)[]>(
        Array(totalQuestions).fill(null)
    );
    const [pianoRollAnswers, setPianoRollAnswers] = useState<string[][]>(
        Array(totalQuestions).fill(null).map(() => [])
    );
    const [isFinished, setIsFinished] = useState(false);

    const handleFinish = () => {
        setIsFinished(true);
    };

    const calculateScore = () => {
        return answers.reduce((acc: number, curr, idx) => {
            const question = levelData.questions[idx];
            if (question.type === "piano_roll") {
                // For piano roll, compare selected notes with correctNotes
                const selectedNotes = pianoRollAnswers[idx] || [];
                const correctNotes = question.correctNotes || [];
                // Check if arrays have same length and contain same notes (order doesn't matter)
                if (selectedNotes.length !== correctNotes.length) {
                    return acc;
                }
                const sortedSelected = [...selectedNotes].sort();
                const sortedCorrect = [...correctNotes].sort();
                return sortedSelected.every((note, i) => note === sortedCorrect[i]) ? acc + 1 : acc;
            } else {
                // For choice questions, compare index
                return curr === question.correct ? acc + 1 : acc;
            }
        }, 0);
    };

    const score = calculateScore();

    const passTest = async () => {
        if (userId) {
            try {
                const newHighestLevel = levelNumber - 1;
                console.log(`✅ User passed levelNumber ${levelNumber}, setting highestLevelPassed to ${newHighestLevel} for userId: ${userId}`);
                await updateUserProgress(userId, newHighestLevel);
            } catch (error: any) {
                console.error("❌ ERROR: Failed to save progress to Firebase:", error);
                const errorMsg = error?.message || "Unknown error";
                alert(`Warning: Could not save your progress.\n\nError: ${errorMsg}`);
            }
        }
        navigate("/lessons");
    };

    const redoTest = () => {
        setIsFinished(false);
        setAnswers(Array(totalQuestions).fill(null));
        setPianoRollAnswers(Array(totalQuestions).fill(null).map(() => []));
        setCurrentQ(0);
    };

    if (isFinished) {
        const passed = score >= (totalQuestions / 2);
        return (
            <div className="popup-overlay">
                <div className="popup-box" style={{ maxWidth: "600px", width: "95%", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
                    {passed ? (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ height: "10rem" }}>
                                <img src="/img/rewards.png" alt="reward" style={{ height: "100%", width: "100%", objectFit: "contain" }} />
                            </div>
                            <h1>🎉 Congratulations! 🎉</h1>
                            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Final score: {score}/{totalQuestions}</p>
                            <p>You Passed! You’re ready for the next lesson.</p>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ height: "10rem" }}>
                                <img src="/img/fail.png" alt="fail" style={{ height: "100%", width: "100%", objectFit: "contain" }} />
                            </div>
                            <h1>👍 Better Luck Next Time</h1>
                            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Final score: {score}/{totalQuestions}</p>
                            <p>You’re improving! Give it another try...</p>
                        </div>
                    )}

                    <div style={{ marginTop: "2rem", textAlign: "left" }}>
                        <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "0.5rem" }}>Review Results</h3>
                        {levelData.questions.map((question, idx) => {
                            const userAnswer = answers[idx];
                            let isCorrect: boolean;
                            let userAnswerDisplay: string;
                            let correctAnswerDisplay: string;

                            if (question.type === "piano_roll") {
                                const selectedNotes = pianoRollAnswers[idx] || [];
                                const correctNotes = question.correctNotes || [];
                                const sortedSelected = [...selectedNotes].sort();
                                const sortedCorrect = [...correctNotes].sort();
                                isCorrect = selectedNotes.length === correctNotes.length &&
                                    sortedSelected.every((note, i) => note === sortedCorrect[i]);
                                userAnswerDisplay = selectedNotes.length > 0 
                                    ? selectedNotes.join("–") 
                                    : "No Answer";
                                correctAnswerDisplay = correctNotes.join("–");
                            } else {
                                isCorrect = userAnswer === question.correct;
                                userAnswerDisplay = userAnswer !== null 
                                    ? question.choices[userAnswer as number] 
                                    : "No Answer";
                                correctAnswerDisplay = question.choices[question.correct];
                            }

                            return (
                                <div key={idx} style={{ 
                                    padding: "1rem", 
                                    marginBottom: "1rem", 
                                    backgroundColor: "rgba(255,255,255,0.05)", 
                                    borderRadius: "0.5rem",
                                    borderLeft: `5px solid ${userAnswer === null && (!question.type || pianoRollAnswers[idx]?.length === 0) ? "#888" : isCorrect ? "#29B839" : "#D10909"}`
                                }}>
                                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>Q{idx + 1}. {question.question}</p>
                                    <p style={{ margin: "0", fontSize: "0.9rem" }}>
                                        Your Answer: <span style={{ color: (userAnswer === null && (!question.type || pianoRollAnswers[idx]?.length === 0)) ? "#888" : isCorrect ? "#53CA61" : "#CA5353" }}>
                                            {userAnswerDisplay}
                                        </span>
                                    </p>
                                    {!isCorrect && (userAnswer !== null || (question.type === "piano_roll" && pianoRollAnswers[idx]?.length > 0)) && (
                                        <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.9rem", color: "#29B839" }}>
                                            Correct Answer: {correctAnswerDisplay}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="popup-buttons" style={{ marginTop: "2rem", justifyContent: "center", display: "flex", gap: "1rem" }}>
                        {passed ? (
                            <button onClick={passTest} style={{ padding: "0.8rem 2rem", backgroundColor: "#29B839", borderRadius: "0.5rem", color: "white" }}>Continue</button>
                        ) : (
                            <button onClick={redoTest} style={{ padding: "0.8rem 2rem", backgroundColor: "#4078C3", borderRadius: "0.5rem", color: "white" }}>Try Again</button>
                        )}
                        <button onClick={() => navigate("/lessons")} style={{ padding: "0.8rem 2rem", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "white" }}>Back to Lessons</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem 5rem" }}>
            <div className="teach-page-header">
                <h1>Level - {levelData.level_number} Test</h1>
                <h3>{levelData.level_name}</h3>
                <div style={{ position: "absolute", right: "2rem", top: "2rem" }}>
                    Question {currentQ + 1} / {totalQuestions}
                </div>
            </div>
            <div className="teach-page-content" style={{ minHeight: "60vh", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1 }}>
                    <p><span style={{ backgroundColor: "#144387", borderRadius: "1rem", padding: "0.5rem" }}>Q{currentQ + 1}.</span> {q.question}</p>
                    {q.type === "piano_roll" ? (
                        <div style={{ marginLeft: "2rem", marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                            <PianoRollAnswer
                                selectedNotes={pianoRollAnswers[currentQ] || []}
                                onNotesChange={(notes) => {
                                    const newPianoRollAnswers = [...pianoRollAnswers];
                                    newPianoRollAnswers[currentQ] = notes;
                                    setPianoRollAnswers(newPianoRollAnswers);
                                    // Also update answers array for consistency
                                    const newAnswers = [...answers];
                                    newAnswers[currentQ] = notes.length > 0 ? notes : null;
                                    setAnswers(newAnswers);
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{ marginLeft: "2rem", marginTop: "2rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto", gap: "1rem 2rem" }}>
                                {q.choices.map((choice, cIndex) => {
                                    const selected = answers[currentQ] === cIndex;
                                    let bgColor, bgColor2;

                                    if (selected) {
                                        bgColor = "#0F66F3";
                                        bgColor2 = "#4489F9";
                                    } else {
                                        bgColor = "#4078C3";
                                        bgColor2 = "#5386CA";
                                    }
                                    return (
                                        <label
                                            key={choice}
                                            className="choiceBtn"
                                            style={{ display: "flex", cursor: "pointer", backgroundColor: bgColor2 }}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${currentQ}`}
                                                checked={selected}
                                                onChange={() =>
                                                    setAnswers((prev) => {
                                                        const newAnswers = [...prev];
                                                        newAnswers[currentQ] = cIndex;
                                                        return newAnswers;
                                                    })
                                                }
                                                style={{ display: "none" }}
                                            />
                                            <div style={{ backgroundColor: bgColor, borderRadius: "1rem 0 0 1rem", padding: "1rem" }}>{cIndex + 1}</div>
                                            <div style={{ padding: "1rem 0.5rem 1rem 1rem" }}>{choice}</div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                    <div 
                        className="playbtn" 
                        style={{ 
                            width: "8rem", 
                            visibility: currentQ > 0 ? "visible" : "hidden",
                            backgroundColor: "rgba(255,255,255,0.1)" 
                        }} 
                        onClick={() => setCurrentQ(prev => prev - 1)}
                    >
                        Back
                    </div>
                    
                    {currentQ < totalQuestions - 1 ? (
                        <div 
                            className="playbtn" 
                            style={{ width: "8rem" }} 
                            onClick={() => setCurrentQ(prev => prev + 1)}
                        >
                            Next
                        </div>
                    ) : (
                        <div 
                            className="playbtn" 
                            style={{ width: "8rem", backgroundColor: "#29B839" }} 
                            onClick={handleFinish}
                        >
                            Finish
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionPage;
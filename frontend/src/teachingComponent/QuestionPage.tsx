import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import questions from "./subComponent/QuestionList.json";
import { subscribeAuth } from "../auth";
import { updateUserProgress } from "../data/lessonProgression";
import PianoRollAnswer from "./subComponent/PianoRollAnswer";
import { useTheme } from "../ThemeContext";
import "../App.css";

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
    useTheme();
    const navigate = useNavigate();
    const { level } = useParams<{ level: string }>();
    const levelNumber = Number(level);
    
    const [currentQ, setCurrentQ] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const levelData = (questions as LevelData[]).find(l => l.level_number === levelNumber);
    
    useEffect(() => {
        const unsub = subscribeAuth((user) => setUserId(user?.uid ?? null));
        return () => unsub();
    }, []);

    if (!levelData) return <div className="modern-container"><h1>Level not found</h1></div>;
    
    const totalQuestions = levelData.questions.length;
    const [answers, setAnswers] = useState<(number | string[] | null)[]>(Array(totalQuestions).fill(null));
    const [pianoRollAnswers, setPianoRollAnswers] = useState<string[][]>(Array(totalQuestions).fill(null).map(() => []));

    const handleFinish = () => setIsFinished(true);

    const calculateScore = () => {
        return answers.reduce((acc: number, curr, idx) => {
            const question = levelData.questions[idx];
            if (question.type === "piano_roll") {
                const selectedNotes = pianoRollAnswers[idx] || [];
                const correctNotes = question.correctNotes || [];
                if (selectedNotes.length !== correctNotes.length) return acc;
                const sortedSelected = [...selectedNotes].sort();
                const sortedCorrect = [...correctNotes].sort();
                return sortedSelected.every((note, i) => note === sortedCorrect[i]) ? acc + 1 : acc;
            } else {
                return curr === question.correct ? acc + 1 : acc;
            }
        }, 0);
    };

    const score = calculateScore();
    const progress = ((currentQ + 1) / totalQuestions) * 100;

    const passTest = async () => {
        if (userId) {
            try {
                await updateUserProgress(userId, levelNumber - 1);
            } catch (error) {
                console.error("Failed to save progress:", error);
            }
        }
        navigate("/lessons", {
            state: {
                lessonIndex: levelNumber - 1,
                score: Math.round((score / totalQuestions) * 100),
            },
        });
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
            <div className="modern-container" style={{ padding: '2rem' }}>
                <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    {passed ? (
                        <div style={{ animation: 'bounceIn 0.8s ease' }}>
                            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏆</div>
                            <h1 className="modern-title" style={{ fontSize: '3rem' }}>Brilliant!</h1>
                            <p style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 600 }}>Score: {score} / {totalQuestions}</p>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>You've mastered these concepts and are ready for the next level.</p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🕯️</div>
                            <h1 className="modern-title" style={{ fontSize: '3rem', filter: 'hue-rotate(180deg)' }}>Carry On</h1>
                            <p style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 600 }}>Score: {score} / {totalQuestions}</p>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Persistence is key. Review the results below and try again.</p>
                        </div>
                    )}

                    <div style={{ textAlign: 'left', marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', opacity: 0.8 }}>Review Summary</h3>
                        {levelData.questions.map((question, idx) => {
                            const selectedNotes = pianoRollAnswers[idx] || [];
                            const correctNotes = question.correctNotes || [];
                            const isCorrect = question.type === "piano_roll" 
                                ? (selectedNotes.length === correctNotes.length && [...selectedNotes].sort().every((n, i) => n === [...correctNotes].sort()[i]))
                                : (answers[idx] === question.correct);

                            return (
                                <div key={idx} className="lesson-card" style={{ 
                                    padding: '1.25rem', 
                                    background: 'rgba(255,255,255,0.02)',
                                    borderColor: isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div style={{ 
                                            flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.9rem', fontWeight: 'bold',
                                            background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: isCorrect ? '#4ade80' : '#f87171'
                                        }}>
                                            {isCorrect ? '✓' : '✗'}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>Q{idx + 1}. {question.question}</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.7 }}>
                                                Answered: <span style={{ fontWeight: 600 }}>
                                                    {question.type === "piano_roll" ? (selectedNotes.length > 0 ? selectedNotes.join(", ") : "None") : (answers[idx] !== null ? question.choices[answers[idx] as number] : "None")}
                                                </span>
                                            </p>
                                            {!isCorrect && (
                                                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#4ade80', fontWeight: 600 }}>
                                                    Solution: {question.type === "piano_roll" ? correctNotes.join(", ") : question.choices[question.correct]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        {passed ? (
                            <button onClick={passTest} className="start-btn" style={{ flex: 1 }}>Continue to Journey</button>
                        ) : (
                            <button onClick={redoTest} className="start-btn" style={{ flex: 1, filter: 'hue-rotate(220deg)' }}>Retake Exam</button>
                        )}
                        <button onClick={() => navigate("/lessons")} className="back-btn" style={{ padding: '0.8rem 2rem' }}>Quit to Lessons</button>
                    </div>
                </div>
            </div>
        );
    }

    const q = levelData.questions[currentQ];

    return (
        <div className="modern-container">
            <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
                {/* Progress Header */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem 2.5rem', borderBottom: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 className="modern-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.8rem' }}>{levelData.level_name} Challenge</h2>
                            <p style={{ color: 'var(--text-dim)', margin: '4px 0 0 0' }}>Showcase your musical understanding</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{currentQ + 1}</span>
                            <span style={{ fontSize: '1rem', opacity: 0.5, marginLeft: '4px' }}>/ {totalQuestions}</span>
                        </div>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                            height: '100%', width: `${progress}%`, 
                            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                            transition: 'width 0.4s cubic-bezier(0.1, 0.7, 0.1, 1)'
                        }} />
                    </div>
                </div>

                {/* Question Area */}
                <div style={{ padding: '3rem 2.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', lineHeight: 1.4, marginBottom: '2.5rem', maxWidth: '800px' }}>
                         {q.question}
                    </h3>

                    {q.type === "piano_roll" ? (
                        <div style={{ display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.5s ease' }}>
                            <PianoRollAnswer
                                selectedNotes={pianoRollAnswers[currentQ] || []}
                                onNotesChange={(notes) => {
                                    const newPianoRollAnswers = [...pianoRollAnswers];
                                    newPianoRollAnswers[currentQ] = notes;
                                    setPianoRollAnswers(newPianoRollAnswers);
                                    const newAnswers = [...answers];
                                    newAnswers[currentQ] = notes.length > 0 ? notes : null;
                                    setAnswers(newAnswers);
                                }}
                            />
                        </div>
                    ) : (
                        <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {q.choices.map((choice, cIndex) => {
                                const selected = answers[currentQ] === cIndex;
                                return (
                                    <label key={cIndex} className={`modern-radio-label ${selected ? 'active' : ''}`} style={{ padding: '1.5rem', gap: '1rem' }}>
                                        <input
                                            type="radio"
                                            checked={selected}
                                            onChange={() => setAnswers(prev => {
                                                const newA = [...prev];
                                                newA[currentQ] = cIndex;
                                                return newA;
                                            })}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{ 
                                            width: '32px', height: '32px', borderRadius: '50%', background: selected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: selected ? 'white' : 'var(--text-dim)',
                                            border: selected ? 'none' : '1px solid var(--card-border)'
                                        }}>
                                            {String.fromCharCode(65 + cIndex)}
                                        </div>
                                        <div style={{ fontSize: '1.1rem' }}>{choice}</div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Navigation Footer */}
                <div style={{ padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.1)' }}>
                    <button 
                        className="back-btn" 
                        style={{ padding: '0.8rem 1.5rem', visibility: currentQ > 0 ? 'visible' : 'hidden' }}
                        onClick={() => setCurrentQ(prev => prev - 1)}
                    >
                        Previous Step
                    </button>

                    {currentQ < totalQuestions - 1 ? (
                        <button className="start-btn" onClick={() => setCurrentQ(prev => prev + 1)}>
                            Continue Progression
                        </button>
                    ) : (
                        <button className="start-btn" style={{ background: '#22c55e', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }} onClick={handleFinish}>
                            Analyze Results
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionPage;

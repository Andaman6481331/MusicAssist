import React,{ useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import questions from "./subComponent/QuestionList.json"

export type RawQuestion = {
  question: string;
  choices: string[];
  correct: number;
};

export type LevelData = {
  level_number: number;
  level_name: string;
  questions: RawQuestion[];
};

const QuestionPage: React.FC = () => {
    const navigate = useNavigate();

    const [currentQ, setCurrentQ] = useState(0);
    
    const { level } = useParams<{ level: string }>();
    const levelNumber = Number(level);
    const levelData = (questions as LevelData[]).find(
        l => l.level_number === levelNumber
    );
    
    if (!levelData) {
        return <p>Level not found</p>;
    }
    
    const q = levelData.questions[currentQ];  
    // const [answers, setAnswers] = useState<Record<number, number>>({});
    const totalQuestions = levelData.questions.length;

    const [answers, setAnswers] = useState<(number | null)[]>(
        Array(totalQuestions).fill(null)
    );
    const [score, setScore] = useState(0);
    const [submitted, setSubmitted] = useState<boolean>();

    const handleSubmit = (questionIndex: number) => {
        const selected = answers[questionIndex];
        if (selected === null || selected === undefined) return;

        const correct = levelData.questions[questionIndex].correct;

        if (selected === correct) {
            setScore(prev => prev + 1);
        };

        setSubmitted(true);

        setTimeout(() => {
            setSubmitted(false);
            setCurrentQ(prev => prev + 1);
        }, 1500);
    };

    const passTest = () => {
        // highestLevelPassed = levelNumber - 1 //
        navigate("/lessons");
    };
    const redoTest = () => {
        setScore(0);
        setAnswers([null]);
        setCurrentQ(0);
    };

    if (currentQ >= totalQuestions) {
        return (
            <div className="popup-overlay">
                <div className="popup-box">
                    {score > (totalQuestions/2) ? (
                        <div>
                            <div style={{height:"10rem"}}>
                                <img src="/img/rewards.png" alt="reward" style={{
                                    height: "100%",
                                    width: "100%",
                                    objectFit: "contain",
                                    display: "block"
                                    }}/>
                            </div>
                            <h1>🎉Congratulation🎉</h1>
                            <p style={{fontWeight:"bolder", margin:0}}>
                                Final score: {score}/{totalQuestions}
                            </p>
                            <p style={{margin:0}}>
                                You Passed! You’re ready for the next lesson.
                            </p>
                            <div className="popup-buttons">
                                <button onClick={()=>passTest()}>Continue</button>
                            </div>
                        </div>
                        ):(
                        <div>
                            <div style={{height:"10rem"}}>
                                <img src="/img/fail.png" alt="fail" style={{
                                    height: "100%",
                                    width: "100%",
                                    objectFit: "contain",
                                    display: "block"
                                    }}/>
                            </div>
                            <h1>👍Better Luck Next Time</h1>
                            <p style={{fontWeight:"bolder", margin:0}}>
                                Final score: {score}/{totalQuestions}
                            </p>
                            <p style={{margin:0}}>
                                You’re improving! Give it another try... 
                            </p>
                            <div className="popup-buttons">
                                <button onClick={()=>redoTest()}>Try Again</button>
                            </div>
                        </div>)
                    }
                </div>
            </div>
        );
    }
    
    return(
        <div style={{padding:"2rem 5rem"}}>
            <div className="teach-page-header">
                <h1>Level - {levelData.level_number} Test</h1>
                <h3>{levelData.level_name}</h3>
                {/* <Link style={{position:"absolute", left:"2rem", top:"2rem"}} to={"/levels"}>
                    <img src="/icon/arrow-left.svg" alt="back" />
                </Link> */}
                <div style={{position:"absolute", right:"2rem", top:"2rem"}}>
                     {score} / {totalQuestions}
                </div>
            </div>
            <div className="teach-page-content">
                    <div>
                        
                        <p><span style={{backgroundColor:"#144387", borderRadius:"1rem", padding:"0.5rem"}}>Q{currentQ+1}.</span> {q.question}</p>
                        <div style={{marginLeft:"2rem"}}>
                            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"auto", gap:"1rem 2rem"}}>
                                {q.choices.map((choice, cIndex) => {
                                    const selected = answers[currentQ] === cIndex;
                                    const isCorrect = cIndex === q.correct; 
                                    let bgColor, bgColor2;

                                    if (submitted) {
                                        if (selected && isCorrect) {
                                            bgColor = "#29B839"
                                            bgColor2 = "#53CA61"
                                        }
                                        else if (selected && !isCorrect) {
                                            bgColor = "#D10909"
                                            bgColor2 = "#CA5353"
                                        }
                                        else if (isCorrect){
                                            bgColor = "#29B839"
                                            bgColor2 = "#53CA61"
                                        } else {
                                            bgColor = "#4078C3"
                                            bgColor2 = "#5386CA"
                                        }
                                    } else if (selected) {
                                        bgColor = "#0F66F3"
                                        bgColor2 = "#4489F9"
                                    } else {
                                        bgColor = "#4078C3"
                                        bgColor2 = "#5386CA"
                                    }
                                    return(
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
                                            !submitted &&
                                            setAnswers((prev) => ({
                                                ...prev,
                                                [currentQ]: cIndex,
                                            }))
                                            }
                                            style={{ display: "none" }}
                                        />
                                        <div style={{backgroundColor: bgColor ,borderRadius:"1rem 0 0 1rem", padding:"1rem"}}>{cIndex+1}</div>
                                        <div style={{padding:"1rem 0.5rem 1rem 1rem"}}>{choice}</div>
                                    </label>
                                )})}
                            </div>
                        </div>
                    </div>
                    <div className="playbtn" style={{width:"5rem", justifySelf:"flex-end"}} onClick={()=> {handleSubmit(currentQ)}}>Submit</div>
            </div>
        </div>
    )
}

export default QuestionPage;
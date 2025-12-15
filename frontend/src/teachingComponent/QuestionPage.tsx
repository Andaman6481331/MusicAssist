import React,{ useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import questions from "./subComponent/QuestionList.json"

type Question = {
  level: number;
  levelName: string;
  question: string;
  choices: string[];
  correct: number;
};

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
    const [checkPopUp, setCheckPopUp] = useState(Boolean);

    const [currentQ, setCurrentQ] = useState(0);
    
    const { level } = useParams<{ level: string }>();
    const levelNumber = Number(level);
    const levelData = (questions as LevelData[]).find(
        l => l.level_number === levelNumber
    );

    if (!levelData) {
        return <p>Level not found</p>;
    }
    
    // const [answers, setAnswers] = useState<Record<number, number>>({});
    const totalQuestions = levelData.questions.length;

    const [answers, setAnswers] = useState<(number | null)[]>(
        Array(totalQuestions).fill(null)
    );
    const [score, setScore] = useState(0);
    const [submitted, setSubmitted] = useState<boolean>();

    const handleResult = () => {
        setTimeout(()=>{
            navigate("/result");
        },1500)
    }

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
            if(questionIndex+1 == totalQuestions){
                handleResult();
            }
            setCurrentQ(prev => prev + 1);
        }, 1500);
    };

    const q = levelData.questions[currentQ];  
    
    return(
        <div style={{padding:"2rem 5rem"}}>
            <div className="teach-page-header">
                <h1>Level - {levelData.level_number} Test</h1>
                <h3>{levelData.level_name}</h3>
                <Link style={{position:"absolute", left:"2rem", top:"2rem"}} to={"/levels"}>
                    <img src="/icon/arrow-left.svg" alt="back" />
                </Link>
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
            {checkPopUp &&(
                <div className="popup-overlay">
                    <div className="popup-box">
                        Checking
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuestionPage;



{/* <div className="teach-page-content">
                {levelData.questions.map((q, qIndex) => (
                    <div key={qIndex}>
                        <p><span style={{backgroundColor:"#144387", borderRadius:"1rem", padding:"0.5rem"}}>Q{qIndex + 1}.</span> {q.question}</p>
                        <div style={{marginLeft:"2rem"}}>
                            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"auto", gap:"1rem 2rem"}}>
                                {q.choices.map((choice, cIndex) => {
                                    const isSelected = answers[qIndex] === cIndex;
                                    const isCorrect = cIndex === q.correct;

                                    if (submitted) {
                                        if (selected && isCorrect) bgColor = "#2ecc71"; // correct
                                        else if (selected && !isCorrect) bgColor = "#e74c3c"; // wrong
                                        else if (isCorrect) bgColor = "#2ecc71"; // show correct
                                    } else if (selected) {
                                        bgColor = "#1ec7ff";
                                    } 

                                    return(
                                    <label
                                        key={choice}
                                        className="choiceBtn"
                                        style={{ display: "flex", cursor: "pointer", backgroundColor: isSelected ? "#4489F9" : "#5386CA" }}
                                    >
                                    <input
                                        type="radio"
                                        name={`q-${qIndex}`}
                                        value={cIndex}
                                        checked={isSelected}
                                        onChange={() =>
                                        setAnswers((prev) => ({
                                            ...prev,
                                            [qIndex]: cIndex,
                                        }))
                                        }
                                        style={{ display: "none" }}
                                    />
                                    <div style={{backgroundColor: isSelected ? "#0F66F3" : "#4078C3",borderRadius:"1rem 0 0 1rem", padding:"1rem"}}>{cIndex+1}</div>
                                    <div style={{padding:"1rem 0.5rem 1rem 1rem"}}>{choice}</div>
                                    </label>
                                )})}
                            </div>
                        </div>
                    </div>
                ))} */}
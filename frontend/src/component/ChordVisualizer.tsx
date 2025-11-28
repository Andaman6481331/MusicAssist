import {useState, useEffect} from "react";
import ChordPiano from "./ChordPiano";

const ChordVisualizer: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
// const selectedChord = searchParams.get("chord") || "";
  const [selectedMM, setMinorMajor] = useState<string>("");
  const [selectedSus, setSus] = useState<string>("");
  const [selectedExt, setExt] = useState<string>("");
  const [selectedDom, setDom] = useState<string>("");
  const [spSelect, setSp] = useState<string>("");
  const [finalChord, setFinalChord] = useState<string>("Please Select the Chord");
  const [selectedScale, setScale] = useState<string>("");

  const [guidePopup,setGuidePopUp] = useState(false);

  const showChordVisualizerInfo = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the anchor from jumping to top
    alert("This section helps you build and visualize chords with custom extensions, sus, and voicings.");
  };

  //mapping used in the selection Menu
  const groups = [
    {
      name: "CORE QUALITY",
      options: [
        { value: "maj", label: "Major" },
        { value: "m", label: "Minor" },
      ],
    },
    {
      name: "SUSPENDED/AUG/DIM",
      options: [
        { value: "", label: "none" },
        { value: "sus2", label: "Sus2" },
        { value: "sus4", label: "Sus4" },
        { value: "aug", label: "aug" },
        { value: "dim", label: "dim" },
      ],
    },
    {
      name: "EXTENDED",
      options: [
        { value: "", label: "none" },
        { value: "7", label: "7" },
        { value: "9", label: "9" },
        { value: "11", label: "11" },
        { value: "13", label: "13" },
      ],
    },
    {
      name: "DOMINANT",
      options: [
        { value: "", label: "none" },
        { value: "dominant", label: "dominant" },
      ],
    },
    {
      name: "OTHERS",
      options: [
        { value: "", label: "none" },
        { value: "add9", label: "add9" },
        { value: "5", label: "5" },
        { value: "6", label: "6" },
      ],
    },
  ];

  //Compute Actual Chord
  const isUsingOthers = spSelect !== "";
  const isDominant = selectedDom === "dominant";
  const isMajorWithExtension = selectedMM === "maj" && selectedExt !== "" && spSelect === "";

  const mmDisplay = isDominant
    ? ""
    : isMajorWithExtension
      ? "maj"
      : selectedMM === "maj"
        ? ""
        : selectedMM === "m"
          ? "m"
          : "";

    useEffect(() => {
        const chord = `${selectedScale}${mmDisplay}${
            isUsingOthers ? "" : selectedExt
        }${isUsingOthers ? "" : selectedSus}${
            spSelect !== "" ? spSelect : ""
        }`;

        setFinalChord(chord);
    }, [selectedScale, mmDisplay, selectedExt, selectedSus, spSelect, isUsingOthers]);

  const funct = [setMinorMajor, setSus, setExt, setDom, setSp];

    return(
        <div>
            <div style={{display:"flex", alignItems:"center"}}>
              <div style={{display:"flex", alignItems: "center"}}>
                <div className="card-title">Chord Creator</div>
                <div onClick={() => setGuidePopUp(true)}>
                  <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
                </div>
              </div>
          </div>
          <div className="separater-around">
              <div style={{fontSize:"5rem", fontWeight:"700"}}>
              {selectedScale || "C"}
              </div>
              <div style={{display:"flex"}}>
                {["C","D","E","F","G","A","B"].map((Note,i) =>(
                  <button className="notebtn" key={Note+i} onClick={() => setScale(Note)}>
                    {Note}
                  </button>
                ))}
              </div>
            </div>     
          <div style={{display:"flex",flexDirection:"row", justifyContent:"space-around"}}>
            <div>
                   
              <div className="selectormenu-container">
                {groups.map((group, groupIdx) => (
                    <div key={groupIdx}>
                        <h3>{group.name}</h3>
                        <div className="selector-wrapper" key={groupIdx}>
                            {group.options.map((option, optionIdx) => (
                                <div className="option" key={optionIdx}>
                                <input
                                    value={option.value}
                                    name={group.name}
                                    type="radio"
                                    className="selector-input"
                                    onClick={() => funct[groupIdx](option.value)}
                                />
                                <div className="selector-btn">
                                    <span className="span">{option.label}</span>
                                </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                </div>
            </div>
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
              <a className="blueBtn">
                {finalChord}
              </a>
              <ChordPiano
                width={40}
                height={160}
                finalChord={finalChord}
                isMuted={isMuted}
              />
            </div>
          </div>
          {guidePopup &&(
              <div className="popup-overlay">
                <div className="popup-box">
                  <h1>How to create Chords?</h1>
                  <p>Select a <span style={{fontWeight:"bold"}}>base chord</span> (like C, D, E, G, etc.), then add an extension such as sus2, sus4, 7, or m7. Click <span style={{fontWeight:"bold"}}>Play</span> to hear the chord — the keys will <span style={{fontWeight:"bold"}}>light up</span> on the piano roll so you can <span style={{fontWeight:"bold"}}>see and learn</span> each note in the chord.</p>
                  <p style={{fontStyle:"italic", color:"black"}}>💡 Tip: Try different extensions to hear how each one changes the chord’s color and mood!</p>
                  <div className="popup-buttons">
                    <button onClick={() => setGuidePopUp(false)}>Got it!</button>
                  </div>
                </div>
              </div>
            )}
          <style>
            {`
            /* From Uiverse.io by LightAndy1 */ 
                    .selectormenu-container{
                    background-color: rgba(171, 171, 171, 0.13);
                    border: 1px solid #ffffff5d;
                    border-radius: 0.5rem;
                    width: 25rem;
                    padding: 0 1rem 1rem 1rem;
                    user-select: none;
                    & h3{
                        margin: 0.3rem 0.5rem;
                        color: rgb(204, 217, 226);
                    }
                    }

                    .selector-wrapper {
                        --bg-color: rgb(28, 105, 160);
                        position: relative;
                        height: 2.5rem;
                        background: linear-gradient(#074689, #033e7d);
                        /* background-color: var(--bg-color); */
                        border-radius: 3px;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-around;
                        margin-bottom: 1rem;
                    }
                    
                    .option {
                        margin-right: 5px;
                        width: 80.5px;
                        height: 28px;
                        position: relative;
                        /* & :hover{
                        background-color: rgba(240, 248, 255, 0.312);
                        } */
                    }
                    
                    .selector-input {
                        width: 90%;
                        height: 90%;
                        position: absolute;
                        appearance: none;
                        cursor: pointer;
                        
                    }
                    
                    .selector-btn {
                        width: 100%;
                        height: 100%;
                        border-radius: 50px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    .span {
                        color: var(--font-color-dark);
                    }
                    
                    .selector-input:checked + .selector-btn .span {
                        font-weight: bolder;
                        color: white;
                    }
            `}
          </style>
        </div>
    )
}

export default ChordVisualizer;
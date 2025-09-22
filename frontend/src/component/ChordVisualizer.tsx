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
            <div style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
            <h1 className="card-title" >Chord Visualizer</h1>
            <a href="#" onClick={showChordVisualizerInfo}>
              <img src="/icon/info.svg" alt="Info" style={{ width: '2rem', height: '2rem', cursor: 'pointer'}} />
            </a>
          </div>
          <div className="separater-around">
              <div style={{fontSize:"5rem", fontWeight:"700"}}>
              {selectedScale || "C"}
              </div>
              <div style={{display:"flex"}}>
                {["C","D","E","F","G","A","B"].map((Note) =>(
                  <button className="notebtn" onClick={() => setScale(Note)}>
                    {Note}
                  </button>
                ))}
              </div>
            </div>     
          <div style={{display:"flex",flexDirection:"row"}}>
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
        </div>
    )
}

export default ChordVisualizer;
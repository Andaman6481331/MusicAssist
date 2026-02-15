import React,{useState} from "react";
import CircleOfFifths from "./CircleofFifth";
import ChordVisualizer from "./TriadsPiano";

const Triads: React.FC = () => {
    const [selectedChord, setSelectedChord] = useState<string>("");
    const [guidePopup, setGuidePopUp] = useState(false);

    return(
        <div>
          <div style={{flexDirection:"column"}}>
            <div style={{display:"flex", alignItems: "center"}}>
              <div className="card-title">Piano Traids</div>
              <div onClick={() => setGuidePopUp(true)}>
                <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
              </div>
            </div>
            <h1 className="card-title" style={{marginRight: "auto"}}>Chords : {selectedChord}</h1>
            <div className="card1">
              <CircleOfFifths
                  selectedChord={selectedChord}
                  setSelectedChord={setSelectedChord}
                />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ChordVisualizer 
                  selectedChord={selectedChord}
                />
              </div>
            </div>
            {guidePopup &&(
              <div className="popup-overlay">
                <div className="popup-box">
                  <h1>What is Triad?</h1>
                  <p>A <span style={{fontWeight:"bold"}}>triad</span> is a basic three-note chord built from a <span style={{fontWeight:"bold"}}>root note, a third, and a fifth</span> — it’s the foundation of most piano harmonies. Click any <span style={{fontWeight:"bold"}}>note inside the circle</span> to set it as the root. The program will then <span style={{fontWeight:"bold"}}>play the full triad</span>, letting you hear and see how the chord is formed.</p>
                  <p style={{fontStyle:"italic", color:"black"}}>💡 Tip: Try different roots to notice how major and minor triads sound different!</p>
                  <div className="popup-buttons">
                    <button onClick={() => setGuidePopUp(false)}>Got it!</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    )
}

export default Triads;
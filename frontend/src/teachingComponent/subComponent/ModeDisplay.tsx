import PianoVisualizer from "../../component/PianoVisualizer";
import { useRef,useState,useEffect,useContext } from "react";
import * as Tone from "tone";
import { SamplerContext } from "../../App";

const dLoop =[
    // Dm7 → G → Dm7 → G → (loop)
    ["D4","F4","A4","C5"],
    ["G4","B4","D5"]
];
const mLoop = [
    //G → F → G → F → (loop)
    ["G4","B4","D5"],
    ["F4","A4","C5"]
];
type Mode = "Dorian" | "Mixolydian";


const ModeDisplay: React.FC = () => {
    const sampler = useContext(SamplerContext);
    const [selectedMode, setMode] = useState<Mode>("Dorian");
    const [playingNote, setPlayingNote] = useState<string | null>(null);
    const [isPlaying, setPlayingState] = useState<Boolean>(false);
    const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [feeling,setFeeling] = useState("But what do each mode feel like?");

    //lower looping sound
    const loopVolumeRef = useRef<Tone.Volume | null>(null);

    useEffect(() => {
    loopVolumeRef.current = new Tone.Volume(-12).toDestination(); // 🔉 lower volume
    }, []);

    const playChord = (chord: string[]) => {
        if (!sampler?.samplerRef.current || !loopVolumeRef.current) return;

        sampler.samplerRef.current.connect(loopVolumeRef.current);

        chord.forEach(note => {
            sampler.samplerRef.current!.triggerAttackRelease(note, "8n");
        });
    };


    const stopPlaying = () => {
        setPlayingState(false);
        if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
        }
        setPlayingNote(null);
    };


    const toggleMode = () => {
        stopPlaying();
        if (selectedMode == "Mixolydian"){
        setMode("Dorian");
        }else if (selectedMode == "Dorian"){
        setMode("Mixolydian");
        }
    }

    const loopMode = (mode: Mode) => {
        const loop = mode === "Mixolydian" ? mLoop : dLoop;
        
        // Clicking same mode → stop
        if (playingNote === mode) {
            stopPlaying();
            return;
        }
        stopPlaying(); // stop any existing loop
        
        let step = 0;
        setPlayingState(true);
        
        // play immediately
        playChord(loop[step]);

        playIntervalRef.current = setInterval(() => {
            step = (step + 1) % loop.length;
            playChord(loop[step]);
        }, 1000); // adjust tempo here

        setPlayingNote(mode);
    };

    return(
        <div>
            <div style={{display:"flex", justifyContent:"center"}}>
                <h2>To keep a mode: Avoid strong resolution.</h2>
                <div style={{display:"flex",marginLeft:"2rem", padding:0, alignSelf:"center"}}>
                    <button className="patternBtn" onClick={() => toggleMode()} >
                        Mode : {selectedMode}
                    </button>
                    <button className="playbtn" onClick={()=>{!isPlaying? loopMode(selectedMode) : stopPlaying()}}>{isPlaying ?"Stop" : "Play"}</button>
                </div>
            </div>
            <div style={{width:"100%", textAlign:"center", backgroundColor:"#ffffff25", padding:"0.5rem 0"}}>
                <h4>{selectedMode==="Mixolydian"?"Major, but relaxed":selectedMode==="Dorian"?"Minor, but not sad":" What each mode feel like?"}</h4>
            </div>
            <div style={{margin:"2rem 50%", height:"150px"}}>
                <PianoVisualizer
                    mode={selectedMode ?? undefined}
                    />
            </div>
            <p style={{textAlign:"center"}}>“This progression loops to keep the mode’s color. Listen to how it never fully resolves.”</p>
            <div style={{display:"flex", justifyContent:"center"}}>
                <div>
                    <h4 style={{margin:0}}>How to Play?</h4>
                    <ul style={{margin:0}}>
                        <li>Choose the Mode type</li>
                        <li>Listen to a looping progression by clicking "Play"</li>
                        <li>Play notes inside the mode while looping</li>
                        <li style={{fontWeight:"bold"}}>See how you feel about the sounds</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ModeDisplay;
import PianoVisualizer from "../../component/PianoVisualizer";

const InversionDisplay: React.FC = () => {
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    const rootInvert = [0,4,7];
    const firstInvert = [4,7,12];
    const secondInvert = [7,12,16];

    return(
        <div>
            <div>
asdfasd
            </div>
            <div>
                <PianoVisualizer
                    isPlayable={false}
                    startOctave={3}
                    scaleLength={3}
                />
            </div>
        </div>
    );
};

export default InversionDisplay;
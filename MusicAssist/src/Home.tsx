import React, {useState} from "react";
import './Home.css';
import CircleOfFifths from './component/CircleofFifth';

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const Home: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

    return (
      <div className="page-container">
        <div className="sidebar">
          {keys.map((key) => (
            <button
              key={key}
              className="sidebtn"
              onClick={() => setSelectedKey(key)}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="container mainbar">
          <h1>Circle of Fifth</h1>
          <CircleOfFifths selectedKey={selectedKey} />
        </div>



      </div> //end of page-container
    );
  };
  
  export default Home;
  
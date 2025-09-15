import { useEffect, useState } from "react";

const WavToJson: React.FC = () =>{
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [success, setSuccess] = useState(false);
    const [jsonData, setJsonData] = useState<any>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [userChoice, setUserChoice] = useState<"overwrite" | "add_anyway" | "cancel">("cancel");
    const [convertChoice, setConvertChoice] = useState<"wav" | "midi">("wav");
    const [error, setError] = useState("");

    const handleConvert = async () => {
        if (!selectedFile) return;

        try {
        // --- Step 1. Check if file exists ---
      const checkRes = await fetch(
        `http://localhost:8000/check-filename?name=${selectedFile.name}`
      );
      const checkData = await checkRes.json();

      if (checkData.exists) {
        // Show popup to let user choose
        setShowPopup(true);
        return;
      }

      // If not exist, just upload with default action
      await uploadFile("add_anyway");
    } catch (err) {
      console.error("Error checking filename:", err);
      setError("Error checking filename.");
    }
  };

  const uploadFile = async (choice: "add_anyway" | "cancel") => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("action", choice);

    try {
      const res = await fetch("http://localhost:8000/wavtojson", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();
      console.log(result.message);

      setJsonData(result.data);
      setSuccess(true);
      setShowPopup(false); // close popup after action
    } catch (err) {
      console.error(err);
      setSuccess(false);
      setError("Upload failed");
    }
  };  

  const acceptMap: Record<string, string> = {
    Midi: ".mid,.midi",
    Wav: ".wav",
    JSON: ".json"
  };
  return (
    <div>
      <style>
      {`
        .black {
          color: black;
          font-weight: bold;
        }
      `}
    </style>
      <div className="upload-box2">
        <input
          type="file"
          accept={acceptMap[convertChoice]}
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          id="fileInput"
          style={{ display: "none" }}
        />
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-around", width:"100%"}}>
          <button className="playbtn2" onClick={() => {
              document.getElementById("fileInput")?.click();
              handleConvert();
            }} 
          >
            <div style={{display:"flex", justifyContent:"center", alignContent:"center"}}>
              <img src="icon/upload.svg" alt="upload-icon"/>
              <span>Choose Files</span>
            </div>
          </button>
          <div style={{display:"flex", justifyContent:"space-between", width:"13rem"}}>
            <button className="ddbtn" style={{display:"flex", justifyContent:"center", alignContent:"center"}} onClick={() => {setConvertChoice(convertChoice === "wav" ? "midi" : "wav")} } >
              <span>{convertChoice.toUpperCase()}</span>  
              <img src="icon/caret-bottom.svg" alt="icon" />
            </button> 
            <h1> to </h1>
            <button className="ddbtn">JSON</button>
          </div>
        </div>
        
      </div>

      {/* Popup for duplicate filename */}
      {success ? (
        <div>
          <h3>{selectedFile?.name} Converted Successfully</h3>
        </div>
      ) : showPopup ? (
        <div className="popup">
          <div className="popup-content">
            <h3>File already exists!</h3>
            <p>What would you like to do?</p>
            <button onClick={() => uploadFile("add_anyway")}>Add Anyway</button>
            <button
              onClick={() => {
                setShowPopup(false);
                setUserChoice("cancel");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : error ? (<p style={{ color: "red" }}>{error}</p>)
      : null}
    </div>
  );
};

export default WavToJson;
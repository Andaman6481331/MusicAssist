import { useEffect, useState } from "react";

const WavToJson: React.FC = () =>{
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [success, setSuccess] = useState(false);
    const [jsonData, setJsonData] = useState<any>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [userChoice, setUserChoice] = useState<"overwrite" | "add_anyway" | "cancel">("cancel");
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

  return (
    <div>
      <input
        type="file"
        accept=".wav"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleConvert} className="playbtn">Convert</button>

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

//     const handleConvert= (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//         // Use the file name without extension
//         const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
//         setSelectedFile(`${nameWithoutExt}`);
//         }
//     };

//     return(
//         <div>
//         <input type="file" onChange={handleConvert}/>
//             {success && (<h3>{selectedFile} Convert Successfully</h3>)}
//         </div>
//     )
// };

export default WavToJson;
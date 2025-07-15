import { useEffect, useState } from "react";

const WavToJson: React.FC = () =>{
    const [selectedFile, setSelectedFile] = useState<string>("");
    const [success, setState] = useState(false);

    const handleConvert= (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        // Use the file name without extension
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setSelectedFile(`${nameWithoutExt}`);
        }
    };

    return(
        <div>
        <input type="file" onChange={handleConvert}/>
            {success && (<h3>{selectedFile} Convert Successfully</h3>)}
        </div>
    )
};

export default WavToJson;
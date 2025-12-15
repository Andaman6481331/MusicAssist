import { useLocation } from "react-router-dom";

const ResultPage: React.FC = () =>{
    const { state } = useLocation();

    if (!state) return <div>No result data</div>;

    const { score, total } = state;

    return (
        <div>
        <h1>Final Result</h1>
        <h2>{score} / {total}</h2>
        </div>
    );
};

export default ResultPage;
import React from "react";
import { useParams, Link } from "react-router-dom";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";

const OutputPage: React.FC = () => {
    const { filename } = useParams();
    
    return (
        <div className="modern-container">
            <div className="glass-card" style={{gap:'0px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <Link to="/data" className="back-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to MyList
                    </Link>
                    <div style={{ textAlign: "center"}}>
                        <h1 className="modern-title">{filename?.replace(/_/g, ' ')}</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Your AI-generated piano composition is ready to play.</p>
                    </div>
                    <div style={{ padding: '4px 12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Generated Track
                    </div>
                </div>


                <div style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '16px', 
                    padding: '24px',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <PianoRollApp 
                        fileName={filename}
                        width={20}
                        height={80}
                    />
                </div>
            </div>
        </div>
    );
};

export default OutputPage;
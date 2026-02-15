interface progressLineProps {
  firstLevel?: string;
  secondLevel?: string;
  thirdLevel?: string;
}

const ProgressLine: React.FC<progressLineProps> = ({
  firstLevel = "first",
  secondLevel = "second",
  thirdLevel = "last",
}) => {
  return (
    <div style={{ position: 'relative', width: '320px' }}>
      <style>
        {`
        .timeline-container {
          position: relative;
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          color: white;
        }

        .timeline-line {
          position: absolute;
          top: 32px;
          left: 10px;
          right: 10px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          z-index: 0;
        }

        .timeline-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          z-index: 1;
          flex: 1;
        }

        .circle {
          width: 32px;
          height: 32px;
          background: rgba(15, 23, 42, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: #94a3b8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .timeline-item.active .circle {
          background: #3b82f6;
          border-color: #60a5fa;
          color: white;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }

        .timeline-item span {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-align: center;
          line-height: 1.2;
        }

        .timeline-item.active span {
          color: #f1f5f9;
        }
        `}
      </style>
      <div className="timeline-container">
        <div className="timeline-line" />

        <div className="timeline-item active">
          <div className="circle">1</div>
          <span>{firstLevel}</span>
        </div>

        <div className="timeline-item">
          <div className="circle">2</div>
          <span>{secondLevel}</span>
        </div>

        <div className="timeline-item">
          <div className="circle">3</div>
          <span>{thirdLevel}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressLine;

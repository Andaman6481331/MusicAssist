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
    <div>
      <style>
        {`
        .timeline-container {
          position: relative;
          display: flex;
          justify-content: space-between;
          padding: 30px 32px 10px 32px;
          color: white;
          width: 25rem;
        }

        .timeline-line {
          position: absolute;
          top: 45%;
          left: 60px;
          right: 60px;
          height: 4px;
          background: white;
          z-index: 0;
        }

        .timeline-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }

        .circle {
          width: 35px;
          height: 35px;
          background: white;
          color: #1e3a8a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
        }

        .timeline-item span {
          margin-top: 8px;
          font-size: 14px;
          font-weight: bold;
        }
        `}
      </style>
      <div className="timeline-container">
        <div className="timeline-line" />

        <div className="timeline-item">
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

import React from 'react';


const LANDMARK_CONNECTIONS = [
  // Face oval
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356],
  [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379],
  [379, 378], [378, 400], [400, 377], [377, 152], [152, 148], [148, 176], [176, 149],
  [149, 150], [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234],
  [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],

  // Left eyebrow
  [336, 296], [296, 334], [334, 293], [293, 300], [300, 276], [276, 283], [283, 282], [282, 295],

  // Right eyebrow
  [70, 63], [63, 105], [105, 66], [66, 107], [107, 55], [55, 65], [65, 52], [52, 53],

  // Left eye
  [362, 382], [382, 381], [381, 380], [380, 374], [374, 373], [373, 390], [390, 249],
  [249, 263], [263, 466], [466, 388], [388, 387], [387, 386], [386, 385], [385, 384],
  [384, 398], [398, 362],

  // Right eye
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155],
  [155, 133], [133, 173], [173, 157], [157, 158], [158, 159], [159, 160], [160, 161],
  [161, 246], [246, 33],

  // Lips
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321],
  [321, 375], [375, 291], [291, 409], [409, 270], [270, 269], [269, 267], [267, 0],
  [0, 37], [37, 39], [39, 40], [40, 185], [185, 61],

  // Pose connections (torso, arms, legs)
  // Shoulders to hips
  [11, 23], [12, 24],
  // Shoulders to elbows
  [11, 13], [12, 14],
  // Elbows to wrists
  [13, 15], [14, 16],
  // Hips to knees
  [23, 25], [24, 26],
  // Knees to ankles
  [25, 27], [26, 28],
  // Shoulders to ears
  [11, 7], [12, 8],
  // Hips connection
  [23, 24],
  // Shoulders connection
  [11, 12],
  // Body midline (optional)
  [0, 11], [0, 12]
];

const LandmarksVisualizer = ({ landmarks, status, width = 640, height = 480 }) => {
  if (!landmarks || landmarks.length === 0) {
    return null;
  }

  
  const drawLandmarks = (ctx) => {
   
    ctx.clearRect(0, 0, width, height);

    
    const lineColor = status === 'correct' ? '#00ff00' : '#ff0000';
    const pointColor = status === 'correct' ? '#00cc00' : '#cc0000';

    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;

    LANDMARK_CONNECTIONS.forEach(connection => {
      const [startIdx, endIdx] = connection;

     
      if (landmarks[startIdx] && landmarks[endIdx]) {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];

        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });

    
    ctx.fillStyle = pointColor;
    landmarks.forEach((landmark, index) => {
      if (landmark && landmark.x && landmark.y) {
       
        ctx.beginPath();
        ctx.arc(
          landmark.x * width,
          landmark.y * height,
          3, // radius
          0,
          2 * Math.PI
        );
        ctx.fill();

       
      }
    });
  };

  
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      drawLandmarks(ctx);
    }
  }, [landmarks, status, width, height]);

  return (
    <div className="landmarks-visualizer">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
      />
      <div className="landmarks-info">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: status === 'correct' ? '#00ff00' : '#ff0000',
            marginRight: '8px'
          }} />
          <span>Status: {status}</span>
          <span style={{ marginLeft: '16px' }}>
            Landmarks detected: {landmarks.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LandmarksVisualizer;
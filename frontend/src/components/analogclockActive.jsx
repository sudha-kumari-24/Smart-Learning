import React, { useState } from 'react';
import AnalogClock from './AnalogClock';


function App() {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div style={{ padding: '20px' }}>
            <AnalogClock isPaused={isPaused} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                    onClick={() => setIsPaused(!isPaused)}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: isPaused ? '#4CAF50' : '#FF5252',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPaused ? 'START' : 'PAUSE'}
                </button>
            </div>
        </div>
    );
}

export default App;
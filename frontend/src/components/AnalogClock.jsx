import React from 'react';

function AnalogClock({ seconds }) {
    const sec = seconds % 60;
    const min = Math.floor(seconds / 60) % 60;
    const hour = Math.floor(seconds / 3600) % 12;

    // Angles
    const secondAngle = sec * 6;
    const minuteAngle = min * 6 + sec * 0.1;
    const hourAngle = hour * 30 + min * 0.5;

    return (
        <div style={styles.clockWrapper}>
            <div style={styles.clock}>
                {/* Clock face with gradient */}
                <div style={styles.face}></div>
                
                {/* Shine overlay */}
                <div style={styles.shine}></div>

                {/* Minute ticks */}
                {[...Array(60)].map((_, i) => {
                    const angle = i * 6;
                    const isHourTick = i % 5 === 0;
                    return (
                        <div
                            key={`tick-${i}`}
                            style={{
                                ...styles.tick,
                                width: isHourTick ? 3 : 1,
                                height: isHourTick ? 16 : 8,
                                background: isHourTick ? '#FFD700' : '#FFC107',
                                opacity: isHourTick ? 1 : 0.6,
                                transform: `rotate(${angle}deg) translateY(-130px)`
                            }}
                        />
                    );
                })}

                {/* Numbers - positioned with absolute positioning */}
                <div style={styles.numberWrapper}>
                    {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hourNum, index) => {
                        let style = { ...styles.number };
                        
                        // Position each number manually for perfect alignment
                        switch(hourNum) {
                            case 12:
                                style = { ...style, top: '20px', left: '50%', transform: 'translateX(-50%)' };
                                break;
                            case 1:
                                style = { ...style, top: '35px', right: '70px' };
                                break;
                            case 2:
                                style = { ...style, top: '80px', right: '30px' };
                                break;
                            case 3:
                                style = { ...style, top: '50%', right: '20px', transform: 'translateY(-50%)' };
                                break;
                            case 4:
                                style = { ...style, bottom: '80px', right: '30px' };
                                break;
                            case 5:
                                style = { ...style, bottom: '35px', right: '70px' };
                                break;
                            case 6:
                                style = { ...style, bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
                                break;
                            case 7:
                                style = { ...style, bottom: '35px', left: '70px' };
                                break;
                            case 8:
                                style = { ...style, bottom: '80px', left: '30px' };
                                break;
                            case 9:
                                style = { ...style, top: '50%', left: '20px', transform: 'translateY(-50%)' };
                                break;
                            case 10:
                                style = { ...style, top: '80px', left: '30px' };
                                break;
                            case 11:
                                style = { ...style, top: '35px', left: '70px' };
                                break;
                            default:
                                break;
                        }

                        return (
                            <div
                                key={`num-${index}`}
                                style={style}
                            >
                                {hourNum}
                            </div>
                        );
                    })}
                </div>

                {/* Hour Hand */}
                <div
                    style={{
                        ...styles.hourHand,
                        transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`
                    }}
                />

                {/* Minute Hand */}
                <div
                    style={{
                        ...styles.minuteHand,
                        transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`
                    }}
                />

                {/* Second Hand */}
                <div
                    style={{
                        ...styles.secondHand,
                        transform: `translate(-50%, -85%) rotate(${secondAngle}deg)`
                    }}
                />

                {/* Center Assembly */}
                <div style={styles.centerAssembly}>
                    <div style={styles.centerRing}></div>
                    <div style={styles.centerDot}></div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    clockWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },

    clock: {
        position: 'relative',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0c0c0c 100%)',
        border: '10px solid #222',
        boxShadow: `
            0 0 0 2px #333,
            0 10px 30px rgba(0,0,0,0.8),
            inset 0 0 20px rgba(0,0,0,0.7),
            inset 0 0 0 1px #444
        `,
        overflow: 'hidden'
    },

    face: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #222 0%, #111 60%, #000 100%)',
    },

    shine: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 1
    },

    tick: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transformOrigin: 'center center',
        borderRadius: 1,
        zIndex: 2
    },

    numberWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 3
    },

    number: {
        position: 'absolute',
        fontSize: 22,
        fontWeight: '700',
        color: '#FFD700',
        fontFamily: 'Arial, sans-serif',
        textShadow: '0 0 6px rgba(255,215,0,0.8), 0 0 10px rgba(255,215,0,0.4)',
        width: 30,
        height: 30,
        textAlign: 'center',
        lineHeight: '30px',
        zIndex: 3
    },

    hourHand: {
        position: 'absolute',
        width: 8,
        height: 65,
        background: 'linear-gradient(to top, #D4AF37 0%, #FFD700 30%, #D4AF37 100%)',
        top: '50%',
        left: '50%',
        transformOrigin: '50% 100%',
        borderRadius: '4px 4px 0 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        zIndex: 4,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    },

    minuteHand: {
        position: 'absolute',
        width: 6,
        height: 95,
        background: 'linear-gradient(to top, #FFC107 0%, #FFD700 30%, #FFC107 100%)',
        top: '50%',
        left: '50%',
        transformOrigin: '50% 100%',
        borderRadius: '3px 3px 0 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        zIndex: 5,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },

    secondHand: {
        position: 'absolute',
        width: 2,
        height: 110,
        background: 'linear-gradient(to top, #FF5252 0%, #FF8A80 50%, #FF5252 100%)',
        top: '50%',
        left: '50%',
        transformOrigin: '50% 85%',
        borderRadius: '1px 1px 0 0',
        boxShadow: '0 0 8px rgba(255,82,82,0.7)',
        zIndex: 6,
        transition: 'transform 0.05s linear'
    },

    centerAssembly: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 7,
        width: 24,
        height: 24
    },

    centerRing: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #444 0%, #222 70%, #000 100%)',
        border: '2px solid #555',
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.6)'
    },

    centerDot: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 10,
        height: 10,
        background: '#FFD700',
        borderRadius: '50%',
        boxShadow: '0 0 10px rgba(255,215,0,0.8), 0 0 20px rgba(255,215,0,0.3)',
        zIndex: 8
    }
};

export default AnalogClock;
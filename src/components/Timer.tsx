import React, { FC, useEffect, useRef, useState } from "react";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";

interface TimerProps {
    currentPlayer: Player | null;
    restart: () => void;
    onTimeUp: (loserColor: Colors) => void;
    isGameOver: boolean;
}

const Timer: FC<TimerProps> = ({currentPlayer, restart, onTimeUp, isGameOver}) => {
    const [blackTime, setBlackTime] = useState(500);
    const [whiteTime, setWhiteTime] = useState(500);
    const timer = useRef<null | ReturnType<typeof setInterval>>(null)

    useEffect(() => {
        if (!isGameOver) {
            startTimer()
        } else if (timer.current) {
            clearInterval(timer.current)
        }
        return () => {
            if (timer.current) {
                clearInterval(timer.current)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPlayer, isGameOver])

    function startTimer() {
        if(timer.current) {
            clearInterval(timer.current)
        }
        const callback = currentPlayer?.color === Colors.WHITE ? decrementWhiteTimer : decrementBlackTimer
        timer.current = setInterval(callback, 1000)
    }

    function decrementBlackTimer() {
        setBlackTime(prev => {
            if (prev <= 1) {
                if (timer.current) clearInterval(timer.current)
                onTimeUp(Colors.BLACK)
                return 0
            }
            return prev - 1
        })
    }

    function decrementWhiteTimer() {
        setWhiteTime(prev => {
            if (prev <= 1) {
                if (timer.current) clearInterval(timer.current)
                onTimeUp(Colors.WHITE)
                return 0
            }
            return prev - 1
        })
    }

    return (
        <div>
            <div>
                <button onClick={restart}>Restart game</button>
            </div>
            <h2>Черные - {blackTime}</h2>
            <h2>Белые - {whiteTime}</h2>
        </div>
    );
};

export default Timer;
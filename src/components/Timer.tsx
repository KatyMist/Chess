import React, { FC, useEffect, useRef, useState } from "react";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";

interface TimerProps {
    currentPlayer: Player | null;
    restart: () => void;
    onTimeUp: (loserColor: Colors) => void;
    isGameOver: boolean;
    initialSeconds: number;
}

const Timer: FC<TimerProps> = ({currentPlayer, restart, onTimeUp, isGameOver, initialSeconds}) => {
    const [blackTime, setBlackTime] = useState(initialSeconds);
    const [whiteTime, setWhiteTime] = useState(initialSeconds);
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

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    return (
        <div>
            <div>
                <button onClick={restart}>Restart game</button>
            </div>
            <h2>Черные - {formatTime(blackTime)}</h2>
            <h2>Белые - {formatTime(whiteTime)}</h2>
        </div>
    );
};

export default Timer;
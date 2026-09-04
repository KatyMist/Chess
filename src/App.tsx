import React, { useEffect, useState } from 'react';
import './App.css';
import BoardComponent from './components/BoardComponent';
import { Board } from './models/Board';
import { Player } from './models/Player';
import { Colors } from './models/Colors';
import LostFigures from './components/LostFigures';
import Timer from './components/Timer';

interface FinishStatus {
    winner: Colors | null;
    reason: 'time' | 'checkmate' | 'stalemate';
}

interface HistoryEntry {
    boardSnapshot: Board;
    playerColor: Colors;
}

const App = () => {
    const [board, setBoard] = useState(new Board())
    const [whitePlayer] = useState(new Player(Colors.WHITE))
    const [blackPlayer] = useState(new Player(Colors.BLACK))
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [finishStatus, setFinishStatus] = useState<FinishStatus | null>(null);

    const [timerEnabled, setTimerEnabled] = useState(true);
    const [minutesPerSide, setMinutesPerSide] = useState(10);

    const [moveHistory, setMoveHistory] = useState<HistoryEntry[]>([]);
    const [resetToken, setResetToken] = useState(0);

    useEffect(() => {
        restart()
        setCurrentPlayer(whitePlayer);
    }, [whitePlayer])

    function restart() {
        const newBoard = new Board();
        newBoard.initCells()
        newBoard.addFigures()
        setBoard(newBoard)
    }

    function handleRestart() {
        setFinishStatus(null);
        setMoveHistory([]);
        setResetToken(t => t + 1);
        restart();
        setCurrentPlayer(whitePlayer);
    }

    function swapPlayer() {
        setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer)
    }

    function handleTimeUp(loserColor: Colors) {
        const winner = loserColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
        setFinishStatus({ winner, reason: 'time' });
    }

    function handleCheckMate(loserColor: Colors) {
        const winner = loserColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
        setFinishStatus({ winner, reason: 'checkmate' });
    }

    function handleStaleMate() {
        setFinishStatus({ winner: null, reason: 'stalemate' });
    }

    function handleBeforeMove() {
        if (!currentPlayer) return;
        setMoveHistory(prev => [
            ...prev,
            { boardSnapshot: board.getDeepCopy(), playerColor: currentPlayer.color }
        ]);
    }

    function handleUndo() {
        setMoveHistory(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            setBoard(last.boardSnapshot);
            setCurrentPlayer(last.playerColor === Colors.WHITE ? whitePlayer : blackPlayer);
            setFinishStatus(null);
            setResetToken(t => t + 1);
            return prev.slice(0, -1);
        });
    }

    return (
        <div className="app">
            <header className="app__header">
                <h1 className="app__logo">
                    <span className="app__logo-crown">♛</span>Chessland<span className="app__logo-crown">♛</span>
                </h1>
            </header>

            <div className="app__layout">
                <aside className="panel panel--timer">
                    <div className="timer-settings">
                        <h4 className="timer-settings__title">Настройки игры</h4>

                        <label className="timer-settings__row">
                            <input
                                type="checkbox"
                                checked={timerEnabled}
                                onChange={e => setTimerEnabled(e.target.checked)}
                                className="timer-settings__checkbox"
                            />
                            <span>Играть с таймером</span>
                        </label>

                        {timerEnabled && (
                            <label className="timer-settings__row timer-settings__row--minutes">
                                <span>Минут на игрока</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={180}
                                    value={minutesPerSide}
                                    onChange={e => setMinutesPerSide(Math.max(1, Number(e.target.value)))}
                                    className="timer-settings__input"
                                />
                            </label>
                        )}

                        <button
                            className="btn-pill btn-pill--undo"
                            onClick={handleUndo}
                            disabled={moveHistory.length === 0}
                        >
                            Отменить ход
                        </button>

                        <p className="timer-settings__hint">
                            Настройки применятся при следующем «Restart game»
                        </p>
                    </div>

                    {timerEnabled ? (
                        <Timer
                            currentPlayer={currentPlayer}
                            restart={handleRestart}
                            onTimeUp={handleTimeUp}
                            isGameOver={!!finishStatus}
                            initialSeconds={minutesPerSide * 60}
                            key={board.gameId}
                        />
                    ) : (
                        <div>
                            <button className="btn-pill" onClick={handleRestart}>Restart game</button>
                            <p className="timer-settings__hint">Игра без таймера</p>
                        </div>
                    )}
                </aside>

                <div className="panel panel--board">
                    <BoardComponent
                        board={board}
                        setBoard={setBoard}
                        currentPlayer={currentPlayer}
                        swapPlayer={swapPlayer}
                        onCheckMate={handleCheckMate}
                        onStaleMate={handleStaleMate}
                        onBeforeMove={handleBeforeMove}
                        resetToken={resetToken}
                    />
                </div>

                <aside className="captured-column">
                    <div className="panel panel--captured-single">
                        <LostFigures
                            title="Черные фигуры"
                            figures={board.lostBlackFigures}
                        />
                    </div>
                    <div className="panel panel--captured-single panel--captured-white">
                        <LostFigures
                            title="Белые фигуры"
                            figures={board.lostWhiteFigures}
                        />
                    </div>
                </aside>
            </div>

            {finishStatus && (
                <div className="game-over-overlay">
                    <div className="game-over-card">
                        <div className="game-over-card__crown">♛</div>
                        <h2 className="game-over-card__title">
                            {finishStatus.reason === 'stalemate'
                                ? 'Ничья'
                                : `${finishStatus.winner === Colors.WHITE ? 'Белые' : 'Черные'} победили!`}
                        </h2>
                        <p className="game-over-card__reason">
                            {finishStatus.reason === 'time' && 'Соперник просрочил время'}
                            {finishStatus.reason === 'checkmate' && 'Мат'}
                            {finishStatus.reason === 'stalemate' && 'Пат — у игрока не осталось ходов'}
                        </p>
                        <button className="btn-pill" onClick={handleRestart}>Начать заново</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
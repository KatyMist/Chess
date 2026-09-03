import React, { useEffect, useState } from 'react';
import './App.css';
import BoardComponent from './components/BoardComponent';
import { Board } from './models/Board';
import { Player } from './models/Player';
import { Colors } from './models/Colors';
import LostFigures from './components/LostFigures';
import Timer from './components/Timer';

interface FinishStatus {
    winner: Colors;
    reason: 'time' | 'checkmate';
}

const App = () => {
    const [board, setBoard] = useState(new Board())
    const [whitePlayer] = useState(new Player(Colors.WHITE))
    const [blackPlayer] = useState(new Player(Colors.BLACK))
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [finishStatus, setFinishStatus] = useState<FinishStatus | null>(null);

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

    return (
        <div className="app">
            <header className="app__header">
                <h1 className="app__logo">
                    <span className="app__logo-crown">♛</span>Chessland<span className="app__logo-crown">♛</span>
                </h1>
            </header>

            <div className="app__layout">
                <aside className="panel panel--timer">
                    <Timer
                        currentPlayer={currentPlayer}
                        restart={handleRestart}
                        onTimeUp={handleTimeUp}
                        isGameOver={!!finishStatus}
                        key={board.gameId}
                    />
                </aside>

                <div className="panel panel--board">
                    <BoardComponent
                        board={board}
                        setBoard={setBoard}
                        currentPlayer={currentPlayer}
                        swapPlayer={swapPlayer}
                        onCheckMate={handleCheckMate}
                    />
                </div>

                <aside className="panel panel--captured">
                    <LostFigures
                        title="Черные фигуры"
                        figures={board.lostBlackFigures}
                    />
                    <LostFigures
                        title="Белые фигуры"
                        figures={board.lostWhiteFigures}
                    />
                </aside>
            </div>

            {finishStatus && (
                <div className="game-over-overlay">
                    <div className="game-over-card">
                        <div className="game-over-card__crown">♛</div>
                        <h2 className="game-over-card__title">
                            {finishStatus.winner === Colors.WHITE ? 'Белые' : 'Черные'} победили!
                        </h2>
                        <p className="game-over-card__reason">
                            {finishStatus.reason === 'time' ? 'Соперник просрочил время' : 'Мат'}
                        </p>
                        <button className="btn-pill" onClick={handleRestart}>Начать заново</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
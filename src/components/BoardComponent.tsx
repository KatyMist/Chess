import React, { FC, useEffect, useState } from "react";
import { Board } from "../models/Board";
import CellComponent from "./CellComponent";
import { Cell } from "../models/Cell";
import { Player } from "../models/Player";
import { Colors } from "../models/Colors";

interface BoardProps {
    board: Board;
    setBoard: (board: Board) => void;
    currentPlayer: Player | null;
    swapPlayer: () => void;
    onCheckMate: (loserColor: Colors) => void;
}

const BoardComponent: FC<BoardProps> = ({board, setBoard, currentPlayer, swapPlayer, onCheckMate}) => {
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
    const [isCheck, setIsCheck] = useState(false);

    function click(cell: Cell) {
        if (
            selectedCell &&
            selectedCell !== cell &&
            selectedCell.figure?.canMove(cell) &&
            board.isMoveLegal(selectedCell, cell, selectedCell.figure.color)
        ) {
            selectedCell.moveFigure(cell);
            board.promoteIfNeeded(cell);
            setSelectedCell(null);
            updateBoard();

            const opponentColor = currentPlayer?.color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;

            if (board.isCheckMate(opponentColor)) {
                setIsCheck(false);
                onCheckMate(opponentColor);
            } else {
                setIsCheck(board.isCheck(opponentColor));
                swapPlayer();
            }
        } else {
            if (cell.figure?.color === currentPlayer?.color) {
                setSelectedCell(cell);
            }
        }
    }

    function highlightCells() {
        board.highlightCells(selectedCell)
        updateBoard()
    }

    useEffect(() =>  {
        highlightCells()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCell])

    function updateBoard() {
        const newBoard = board.getCopyBoard()
        setBoard(newBoard)
    }

    return (
        <div>
            <h3 className="board__status">Текущий игрок {currentPlayer?.color}</h3>
            {isCheck && <h3 className="board__check">Шах!</h3>}
            <div className="board">
                {board.cells.map((row, index) =>
                    <React.Fragment key={index}>
                        {row.map(cell =>
                            <CellComponent
                                click={click}
                                cell={cell}
                                key={cell.id}
                                selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
                            />
                        )}
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

export default BoardComponent;
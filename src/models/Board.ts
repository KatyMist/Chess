import { Cell } from "./Cell";
import { Colors } from "./Colors";
import { Bishop } from "./figures/Bishop";
import { Figure, FigureNames } from "./figures/Figure";
import { King } from "./figures/King";
import { Knight } from "./figures/Knight";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/Queen";
import { Rook } from "./figures/Rook";

export class Board {
    cells: Cell[][] = []
    lostBlackFigures: Figure[] = []
    lostWhiteFigures: Figure[] = []
    gameId: number = Math.random();

    public initCells() {
        for (let i = 0; i < 8; i++) {
            const row: Cell[] = []
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 !== 0) {
                    row.push(new Cell(this, j, i, Colors.BLACK, null))
                } else {
                    row.push(new Cell(this, j, i, Colors.WHITE, null))
                }
            }
            this.cells.push(row);
        }
    }

    public getCopyBoard(): Board {
        const newBoard = new Board();
        newBoard.cells = this.cells;
        newBoard.lostWhiteFigures = this.lostWhiteFigures
        newBoard.lostBlackFigures = this.lostBlackFigures
        newBoard.gameId = this.gameId
        return newBoard;
    }

    public getDeepCopy(): Board {
        const newBoard = new Board();
        newBoard.gameId = this.gameId;
        newBoard.cells = this.cells.map(row =>
            row.map(cell => new Cell(newBoard, cell.x, cell.y, cell.color, null))
        );
        newBoard.lostWhiteFigures = [...this.lostWhiteFigures];
        newBoard.lostBlackFigures = [...this.lostBlackFigures];

        for (let y = 0; y < this.cells.length; y++) {
            for (let x = 0; x < this.cells[y].length; x++) {
                const figure = this.cells[y][x].figure;
                if (figure) {
                    const targetCell = newBoard.getCell(x, y);
                    targetCell.figure = this.cloneFigure(figure, targetCell);
                }
            }
        }
        return newBoard;
    }

    private cloneFigure(figure: Figure, cell: Cell): Figure {
        switch (figure.name) {
            case FigureNames.KING: return new King(figure.color, cell);
            case FigureNames.QUEEN: return new Queen(figure.color, cell);
            case FigureNames.ROOK: return new Rook(figure.color, cell);
            case FigureNames.BISHOP: return new Bishop(figure.color, cell);
            case FigureNames.KNICHT: return new Knight(figure.color, cell);
            case FigureNames.PAWN: {
                const clone = new Pawn(figure.color, cell);
                clone.isFirstStep = (figure as Pawn).isFirstStep;
                return clone;
            }
            default: return new Figure(figure.color, cell);
        }
    }

    public highlightCells(selectedCell: Cell | null) {
        for (let i = 0; i < this.cells.length; i++) {
            const row = this.cells[i];
            for (let j = 0; j < row.length; j++) {
                const target = row[j];
                target.available = this.isLegalHighlight(selectedCell, target);
            }
        }
    }

    private isLegalHighlight(selectedCell: Cell | null, target: Cell): boolean {
        if (!selectedCell?.figure) return false;
        if (!selectedCell.figure.canMove(target)) return false;
        return this.isMoveLegal(selectedCell, target, selectedCell.figure.color);
    }

    public isMoveLegal(from: Cell, to: Cell, color: Colors): boolean {
        const simulation = this.getDeepCopy();
        const simFrom = simulation.getCell(from.x, from.y);
        const simTo = simulation.getCell(to.x, to.y);
        simFrom.moveFigure(simTo);
        return !simulation.isCheck(color);
    }

    public getCell(x: number, y: number) {
        return this.cells[y][x]
    } 

    public getFigures(color: Colors): Figure[] {
        const figures: Figure[] = [];
        for (const row of this.cells) {
            for (const cell of row) {
                if (cell.figure && cell.figure.color === color) {
                    figures.push(cell.figure);
                }
            }
        }
        return figures;
    }

    public getKing(color: Colors): Figure | undefined {
        return this.getFigures(color).find(f => f.name === FigureNames.KING);
    }

    public promoteIfNeeded(cell: Cell) {
        const figure = cell.figure;
        if (figure && figure.name === FigureNames.PAWN) {
            const lastRow = figure.color === Colors.WHITE ? 0 : 7;
            if (cell.y === lastRow) {
                new Queen(figure.color, cell);
            }
        }
    }

    public isCellAttacked(cell: Cell, byColor: Colors): boolean {
        return this.getFigures(byColor).some(figure => figure.canMove(cell));
    }

    public isCheck(color: Colors): boolean {
        const king = this.getKing(color);
        if (!king) return false;
        const enemyColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
        return this.isCellAttacked(king.cell, enemyColor);
    }

    public isCheckMate(color: Colors): boolean {
        if (!this.isCheck(color)) return false;

        for (const figure of this.getFigures(color)) {
            for (const row of this.cells) {
                for (const targetCell of row) {
                    if (figure.canMove(targetCell)) {
                        const simulation = this.getDeepCopy();
                        const simFrom = simulation.getCell(figure.cell.x, figure.cell.y);
                        const simTo = simulation.getCell(targetCell.x, targetCell.y);
                        simFrom.moveFigure(simTo);
                        if (!simulation.isCheck(color)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    public hasAnyLegalMove(color: Colors): boolean {
        for (const figure of this.getFigures(color)) {
            for (const row of this.cells) {
                for (const targetCell of row) {
                    if (figure.canMove(targetCell) && this.isMoveLegal(figure.cell, targetCell, color)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public isStaleMate(color: Colors): boolean {
        if (this.isCheck(color)) return false;
        return !this.hasAnyLegalMove(color);
    }

    public addPawns() {
        for(let i = 0; i < 8; i++) {
            new Pawn(Colors.BLACK, this.getCell(i, 1))
            new Pawn(Colors.WHITE, this.getCell(i, 6))
        }
    }

    private addKings() {
        new King(Colors.BLACK, this.getCell(4, 0))
        new King(Colors.WHITE, this.getCell(4, 7))
    }

    private addQueens() {
        new Queen(Colors.BLACK, this.getCell(3, 0))
        new Queen(Colors.WHITE, this.getCell(3, 7))
    }
    private addBishops() {
        new Bishop(Colors.BLACK, this.getCell(2, 0))
        new Bishop(Colors.BLACK, this.getCell(5, 0))
        new Bishop(Colors.WHITE, this.getCell(2, 7))
        new Bishop(Colors.WHITE, this.getCell(5, 7))
    }

    private addKnights() {
        new Knight(Colors.BLACK, this.getCell(1, 0))
        new Knight(Colors.BLACK, this.getCell(6, 0))
        new Knight(Colors.WHITE, this.getCell(1, 7))
        new Knight(Colors.WHITE, this.getCell(6, 7))
    }

    private addRooks() {
        new Rook(Colors.BLACK, this.getCell(0, 0))
        new Rook(Colors.BLACK, this.getCell(7, 0))
        new Rook(Colors.WHITE, this.getCell(0, 7))
        new Rook(Colors.WHITE, this.getCell(7, 7))
    }

    public addFigures() {
        this.addPawns()
        this.addKnights()
        this.addKings()
        this.addBishops()
        this.addQueens()
        this.addRooks() 
    }
}
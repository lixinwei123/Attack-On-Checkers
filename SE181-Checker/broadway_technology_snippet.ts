export interface Square {
    row: number;
    col: number;
    isEmpty: boolean;
    hasPiece: boolean;
    isWhite: boolean;
    isKing: boolean;
    isSuggest: boolean;
}
export class GameBoardPage implements OnInit {
    checkerSquares: Array<Array<Square>> = [];
    isPlayerWhite = true; // This letiable should be set from firebase upon making game via randomization
    isPieceSelected = false;
    selectedPiece: Square;
    availCaptures: Array<Square>;
    highlightedSquares: boolean[][] = [];
    DIRECTIONS = [[-1,-1],[1,1],[-1,1],[1,-1]];
    
    //helper function to make sure the requested square is in range
    tryGetSquare( i: number, j: number):Square {
        try{
            const square = this.checkerSquares[i][j];
            return square;
        }
        catch (_) {return null;}
    }
    //flip board visually depending on the player
    // Source here: https://stackoverflow.com/questions/19333002/rotate-a-matrix-array-by-180-degrees
    flipBoard(board) {
        const newBoard = JSON.parse(JSON.stringify(board)); // deepcopy
        const reversedBoard = newBoard.reverse();
        reversedBoard.forEach((row) => {
        return row.reverse();
        });
        // fix row and col to ensure that i and j always matches up.
        for (let i = 0; i < reversedBoard.length; i++) {
            for (let j = 0; j < reversedBoard[i].length; j++) {
                reversedBoard[i][j].row = i;
                reversedBoard[i][j].col = j;
            }
        }
        return reversedBoard;
    }
    //user clicks on a piece on the board to trigger this
    selectPiece(squareObj) { 
        this.isPieceSelected = true;
        this.selectedPiece = squareObj;
        const allPossibleMoves: Square[] = this.getAllMoves(this.selectedPiece);
        allPossibleMoves.forEach(square => {
            const row = square.row;
            const col = square.col;
            this.highlightedSquares[row][col] = true;
        });
    }

    //this function is triggered whenever a player clicks on one of the pieces it owns
    getAllMoves(selectedPiece: Square): Array<Square> {
        if(!selectedPiece.hasPiece)return null;
        const possibleMovesToReturn: Square[] = []; // Stores all possible moves as squares
        const row = selectedPiece.row;
        const col = selectedPiece.col; 
        //get all the possible adjacent moves, depending on whether if it's a normal pawn or king pawn
        for(const direction of this.DIRECTIONS){
            const [dr,dc] = [row + direction[0],col + direction[1]];
            const diagonalMove = this.tryGetSquare(dr,dc);
            if(diagonalMove && !diagonalMove.hasPiece && ( direction[0] == 1 && selectedPiece.isKing|| direction[0] == -1)){
                possibleMovesToReturn.push(diagonalMove);
            }
        }
        return possibleMovesToReturn.concat(this.checkCaptureMoves(selectedPiece));
    }

    checkCaptureMoves(selectedPiece:Square):Array<Square>{
        const [row,col] = [selectedPiece.row,selectedPiece.col];
        const possibleMovesToReturn = [];
        const seen = [row * 10 + col];
        const isSeen = (r,c) =>{ // helper lambda function to see if we have seen the square already
            return seen.includes(r * 10 + c);
        }
        const checkCaptureMovesHelper = (currentPiece): void =>{ //dfs function to find all the possible moves
            for(const directionOne of this.DIRECTIONS ){ 
                const [dr1,dc1] = [row + directionOne[0],col + directionOne[1]];
                const diagonalMoveOne = this.tryGetSquare(dr1,dc1);
                if(diagonalMoveOne && diagonalMoveOne.hasPiece && diagonalMoveOne.isWhite != currentPiece.isWhite && ( directionOne[0] == 1 && currentPiece.isKing|| directionOne[0] == -1)){  //check adjacent has enemy piece and check if can move backward(king only)
                    for(const directionTwo of this.DIRECTIONS){//check if we can capture the enemy piece
                        const [dr2,dc2] = [dr1 + directionTwo[0],dc1 + directionTwo[1]];
                        const diagonalMoveTwo = this.tryGetSquare(dr2,dc2);
                        if(diagonalMoveTwo && !diagonalMoveTwo.hasPiece && !(isSeen(dr2,dc2)) && ( directionTwo[0] == 1 && currentPiece.isKing|| directionTwo[0] == -1)){
                            seen.push((dr2*10 + dc2));
                            possibleMovesToReturn.push(diagonalMoveTwo); 
                            checkCaptureMovesHelper(this.checkerSquares[dr2][dc2]);
                        }
                    }
                }
            }
        }  
        checkCaptureMovesHelper(selectedPiece);
        return possibleMovesToReturn;
    }
}
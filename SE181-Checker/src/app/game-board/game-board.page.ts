import { Component, OnInit } from '@angular/core';
import { Square } from 'src/models/square';
import { Observable, empty, combineLatest } from 'rxjs';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { tap, take, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.page.html',
  styleUrls: ['./game-board.page.scss'],
})
//every time a player makes a move, update only one cell, set on click event on empty cell,
//capture empty cell coordinate, send the coordinate via firebase to update other player's move
//needs to populate checkerSquares by determining whether if one is black side or white side.
//
// { game

export class GameBoardPage implements OnInit {
   checkerSquares$: Observable<Array<Array<Square>>>; 
   checkerSquares: Array<Array<Square>> = [];
   uiSquares: Array<Array<Square>> = [];
   isPlayerWhite = true; //This variable should be set from firebase upon making game via randomization 
   isPieceSelected = false; 
   selectedPiece: Square;
   isWhiteMove$: Observable<boolean>; //TODO: update firebase after each move
   gameID: string;
   singlePlayer = false;
  constructor(
    protected authService: AuthService,
    protected dbService: DbService,
    protected activatedRoute: ActivatedRoute,
  ) {
    // this.initialBlackSide();
    console.log(this.checkerSquares);
   }

  ngOnInit() {
    this.authService.getUserId().subscribe(uid => {
      console.log('my user ID is ', uid);
    })
    // Get Game ID from route
    this.activatedRoute.params.subscribe(params => {
      this.gameID = params['id'];
      this.initializePlayer().subscribe(_ => {
          if (this.isPlayerWhite) {
            this.checkerSquares = this.initializeBoard();
            this.checkerSquares$ = this.dbService.getObjectValues<Square[][]>(`games/${this.gameID}/board`).pipe(
              tap(board => {
                this.checkerSquares = board;
              })
            )
          } 
          else {
            this.checkerSquares$ = this.dbService.getObjectValues<Square[][]>(`games/${this.gameID}/board`).pipe(
              map(board => {
                return this.flipBoard(board)

              }),
              
              tap(board => {
                this.checkerSquares = board;
              })
            )
          }
          console.log("isPlayerWhite",this.isPlayerWhite );
          this.dbService.updateObjectAtPath(`games/${this.gameID}/board`, this.checkerSquares);
          this.isWhiteMove$ = this.dbService.getObjectValues(`games/${this.gameID}/isWhiteMove`)
        // }else{
        //   this.uiSquares = this.flipBoard(this.checkerSquares)
        // }
          if (this.isPlayerWhite) {
            this.uiSquares = this.checkerSquares;
          }else{
            this.uiSquares = this.flipBoard(this.checkerSquares);
          }
      })
    })
  }

  //if the player is host, dont change anything, else changew isplayerwhite to false 
  initializePlayer(): Observable<any> {
    const uid$ = this.authService.getUserId();
    // First person in lobby is white. Second person is black.
    const whitePlayerPath = `games/${this.gameID}/whitePlayerUID`
    const isFirst$ = this.dbService.getObjectValues<string>(whitePlayerPath);
    return combineLatest([uid$, isFirst$]).pipe(
      take(1), // Ensures this only runs once per person.
      tap(res => {
          const uid = res[0];
          const whiteUID = res[1];
          if (whiteUID && whiteUID != uid) {
            // You're the second person as white UID already exist.
            this.isPlayerWhite = false;
            this.dbService.updateObjectAtPath(`games/${this.gameID}`, {blackPlayerUID: uid})

          }

          else {
            // You're the first person. You are now white.
            this.isPlayerWhite = true;

            // Claim my rights as the first player.
            this.dbService.updateObjectAtPath(`games/${this.gameID}`, {whitePlayerUID: uid});

          }

      })
    );
  }

  // TODO: write unit test
  // Source: I definitely could not think of this on my own. Source here: https://stackoverflow.com/questions/19333002/rotate-a-matrix-array-by-180-degrees
  flipBoard(board){
    const reversedBoard = board.reverse()
    reversedBoard.forEach(function (row) {
      return row.reverse()
    })
    // fix row and col to ensure that i and j always matches up.
    for(let i = 0; i < board.length;i++){
      for(let j = 0; j < board[i].length;j++){
        board[i][j].row = i;
        board[i][j].col = j;
      }
    }
    return reversedBoard
  }
  
  initializeBoard(): Array<Array<Square>> {
    let rowMax = 8;
    let colMax = 8;
    let checkerSquares: Array<Array<Square>> = [];
    for(let i=0; i < rowMax;i++){
      let rowList = []
      for(let j =0; j < colMax; j++){
        let row,col;
        // Note 2: We no longer need this if statement because we got the flipBoard function that Kevin wrote. 

        // if(this.isPlayerWhite){ //if player is white, make sure to record location of square separate from black
          // row = rowMax - 1 - i;
          // col = colMax - 1 - j;
        // }else{
          row = i;
          col = j;
        // }

          // row = rowMax - 1 - i;
          // col = colMax - 1 - j;
        let squareObj: Square = {
          row: row,
          col: col,
          isEmpty: false, //is white square or dark square
          hasPiece:false, //check to see if this location has any piece
          isWhite: this.isPlayerWhite,  // purpose is to rendar board at different location depending on the player
          isKing: false //if the piece is kinged 
        };
        if((i % 2 == 0 && j % 2 == 0) || (i % 2 == 1 && j % 2 == 1)){
          squareObj.isEmpty = true;
          squareObj.hasPiece = false;
        }else{
          if(i == 4 || i == 3){
            squareObj.isEmpty = false;
            squareObj.hasPiece = false;
          }else if(i > 4){ //if board rendaring is at bottom,default player red/white is at bottom side
            squareObj.isEmpty=false;
            squareObj.hasPiece = true;
            squareObj.isWhite = true
          }
          else{ //if board is at top side, default, black player is at top side 
            squareObj.isEmpty = false;
            squareObj.hasPiece = true;
            squareObj.isWhite = false
          }
        }
        rowList.push(squareObj);
      }
      checkerSquares.push(rowList)
    }
    return checkerSquares;
    
  }

    selectPiece(squareObj){
      this.isPieceSelected = true;
      this.selectedPiece =squareObj
      console.log("piece selected!",squareObj)
    }
  
  makeMove(squareObj: Square) {
    // Everything needed before making a move goes into combineLatest. CombineLatest ensures all observables are done.
    combineLatest([this.isWhiteMove$]).pipe(
      take(1),
    ).subscribe(res => {
      var isWhiteMove: boolean = res[0];
      if (isWhiteMove == null) {
        isWhiteMove = true;
      }
      this.tryMakeMove(squareObj, isWhiteMove);
    })

  }

  // TODO: write a unit test
  areSquaresDiagonal(source: Square, destination: Square): boolean {
    let row2, col2, row, col: number;
    row2 = source.row;
    col2 = source.col;
    row = destination.row;
    col = destination.col;
    
    const isOneRowUp = row2 - 1 == row
    const isOneColLeftOrRight = Math.abs(col2 - col) == 1
    return isOneRowUp && isOneColLeftOrRight;
  }

  /**
   * 
   * @param squareObj the destination square
   */
  tryMakeMove(squareObj: Square, isWhiteMove: boolean){
    // Does not make move under these conditions:
    // 1. Piece is not selected
    // 2. The square has a piece already on it
    // 3. When it's white move, has to select a white piece.
    if(!this.isPieceSelected || squareObj.hasPiece == true || this.selectedPiece.isWhite != isWhiteMove){
      console.log("bad")
      return;
    }

    let row, col,row2,col2;
    row2 = this.selectedPiece.row;
    col2 = this.selectedPiece.col;
    row = squareObj.row;
    col = squareObj.col;
    let isValidMove = false

          
    const doesSquareHavePiece: boolean = squareObj.hasPiece
    if (doesSquareHavePiece) {
      // TODO: let's talk capture here
    }
    else {
      // Empty square, no need to validate capture.
      const areDiagonal = this.areSquaresDiagonal(this.selectedPiece, squareObj);
      if (areDiagonal) {
        console.log('move is valid')
        isValidMove = true;
      }
      
    }
      // Note 1: We can't check if it's one row up & dark square. Because then the piece can move to any dark square a row above it, not just the one directly diagonal to it. Which is why I added areSquaresDiagonal.

      // if(!squareObj.isEmpty && ( (this.validateCapture([row,col],[row2,col2],isWhiteMove,this.selectedPiece.isKing) ) ||
      //   (row2 - 1 == row ) || 
      // (this.selectedPiece.isKing || (row2 -1 == row ||row2 + 1 == row)))
      // ){
      //   console.log("made move successfful")
      //   isValidMove = true;
      // }
      // if(row == 0){
      //   this.checkerSquares[row][col].isKing = true
      //   console.log("kinged!")
      // }
    //   // console.log(this.validateCapture([row,col],[row2,col2],this.isWhiteMove));
    //   if(!squareObj.isEmpty && ( (this.validateCapture([row,col],[row2,col2],isWhiteMove,this.selectedPiece.isKing) ) || (row2 + 1 == row ) || 
    //   (this.selectedPiece.isKing || (row2 + 1 == row ||row2 - 1 == row))
     
    //   )){
    //     console.log("made move successfful")
    //     isValidMove = true;
    //     if(row == 7){
    //       this.checkerSquares[row][col].isKing = true
    //       console.log("kinged!")
    //     }
    //   }
    // }
    if (isValidMove){
      this.checkerSquares[row][col].hasPiece = true
      this.checkerSquares[row][col].isWhite = this.selectedPiece.isWhite;
      this.checkerSquares[row2][col2].hasPiece = false
    }

    // Update isWhiteMove
    this.dbService.updateObjectAtPath(`games/${this.gameID}`, 
    {isWhiteMove: !isWhiteMove})

    //   if(this.selectedPiece.isKing){
    //     this.checkerSquares[row][col].isKing = true;
    //     this.checkerSquares[row2][col2].isKing = false
    //   }
    // }

    // IMPORTANT: before black can update, we need to flip board again.
    var boardToUpdate = this.checkerSquares;
    if (!this.isPlayerWhite) {
      boardToUpdate = this.flipBoard(boardToUpdate)
    }
    this.dbService.updateObjectAtPath(`games/${this.gameID}/board`, boardToUpdate);
  }

  // TODO: returns white if white wins. Black if black wins. Neither if no one has won.
  checkWinCondition(): 'white' | 'black' | 'neither' {
    return;
  }

  validateCapture(emptySquare,piece,isWhiteMove,isKing){
    console.log("piece is",piece)
    console.log("want to move is",emptySquare)
    if(emptySquare[0]== piece[0] && emptySquare[1] == piece[1]){
      return true
    }else if(emptySquare[0] < 0 || emptySquare[1] < 0 || emptySquare[0] > 7 ||  emptySquare[1] > 7 || this.checkerSquares[emptySquare[0]][emptySquare[1]].hasPiece == true){
      return false
    }
    else{
      let row,row2,col1,col2
      if(isKing){
        //if the place you want to move to is 
        if(emptySquare[0] < piece[0]){
          row = emptySquare[0]+ 1
          row2 = row + 1;
        }else{
          row = emptySquare[0] -1 
          row2 = row - 1
        }
      }
      else if(isWhiteMove){
        row = emptySquare[0]+ 1
        row2 = row + 1;
      }else{
        row = emptySquare[0] -1 
        row2 = row - 1
      }
      col1 = emptySquare[1] + 1
      col2 = emptySquare[1] - 1
      let cond1,cond2;
      //if the row underneath or above the row is defined and that row's right column has piece that is the opponent color to the row:
      if (this.checkerSquares[row] != undefined && this.checkerSquares[row][col1] != undefined && this.checkerSquares[row][col1].hasPiece == true && this.checkerSquares[row][col1].isWhite != isWhiteMove){
        console.log("exe1")
        //validate again at the next empty square row to the right side
        cond1 = this.validateCapture([row2,col1 + 1],piece,isWhiteMove,isKing)
        if(cond1 == true){
          this.checkerSquares[row][col1].hasPiece = false; //
          if(this.checkerSquares[row][col1] != undefined && this.checkerSquares[row][col1].isKing){
            this.checkerSquares[row][col1].isKing = false
          }
        }
      }
      //if the row underneath or above the row is defined and that row's left column has piece that is the opponent color to the row:
      if(this.checkerSquares[row] != undefined && this.checkerSquares[row][col2] != undefined && this.checkerSquares[row][col2].hasPiece == true && this.checkerSquares[row][col2].isWhite != isWhiteMove)
      console.log("exe2")
        cond2 = this.validateCapture([row2,col2 - 1],piece,isWhiteMove,isKing)
        if(cond2 == true){
          this.checkerSquares[row][col2].hasPiece = false;
          if(this.checkerSquares[row][col2] != undefined && this.checkerSquares[row][col2].isKing){
            this.checkerSquares[row][col2].isKing = false
          }
        }
      return cond1 || cond2
    }

  }

}

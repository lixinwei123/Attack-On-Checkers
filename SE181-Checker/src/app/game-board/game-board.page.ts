import { Component, OnInit } from '@angular/core';
import { Square } from 'src/models/square';
import { Observable, empty, combineLatest } from 'rxjs';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { tap, take, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Move } from 'src/models/move';
import { PassThrough } from 'stream';

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

          this.checkerSquares$.subscribe();
          console.log("isPlayerWhite",this.isPlayerWhite );
          this.dbService.updateObjectAtPath(`games/${this.gameID}/board`, this.checkerSquares);
          this.isWhiteMove$ = this.dbService.getObjectValues(`games/${this.gameID}/isWhiteMove`)

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
    const newBoard = JSON.parse(JSON.stringify(board)) //deepcopy
    const reversedBoard = newBoard.reverse()
    reversedBoard.forEach(function (row) {
      return row.reverse()
    })
    // fix row and col to ensure that i and j always matches up.
    for(let i = 0; i < reversedBoard.length;i++){
      for(let j = 0; j < reversedBoard[i].length;j++){
        reversedBoard[i][j].row = i;
        reversedBoard[i][j].col = j;
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
      // let helperBoard = this.generateHelperBoard()
      // let availCaptures = this.checkCaptureMoves(this.selectedPiece,helperBoard);
      // console.log('goodies',availCaptures)
      console.log("piece selected!",squareObj)
    }
  
  makeMove(squareObj: Square) {
    // Everything needed before making a move goes into combineLatest. CombineLatest ensures all observables are done.
    const isWhiteMove$ = this.dbService.getObjectValues<boolean>(`games/${this.gameID}/isWhiteMove`)
    combineLatest([isWhiteMove$]).pipe(
      take(1)
    ).subscribe(res => {
      var isWhiteMove: boolean = res[0];
      if (isWhiteMove == null) {
        isWhiteMove = true;
      }
      this.tryMakeMove(squareObj, isWhiteMove);
    })

  }

  // TODO: write a unit test
  /**
   * 
   * @param source 
   * @param destination 
   * @param isKing default is false. True for promoted pieces.
   */
  // For Kings, they can move diagonally backwards as well as forwards. Therefore we modified the isOneRowUp attribute
  areSquaresDiagonal(source: Square, destination: Square, isKing: boolean = false): boolean {
    let row2, col2, row, col: number;
    row2 = source.row;
    col2 = source.col;
    row = destination.row;
    col = destination.col;
    
    var isOneRowUp = row2 - 1 == row
    if (isKing) {
      isOneRowUp = Math.abs(row2 - row) == 1
    }
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
      // Nothing to do here.
    }
    else {
      // Gonna have to talk capture somewhere here. 

      const areDiagonal = this.areSquaresDiagonal(this.selectedPiece, squareObj, this.selectedPiece.isKing);
      let helperBoard = this.generateHelperBoard()
      let availCaptures = this.checkCaptureMoves(this.selectedPiece,helperBoard,squareObj);
      // console.log('available captures',availCaptures)
      if (areDiagonal ) {
        console.log('move is valid')
        isValidMove = true;
      }else if(availCaptures[0]){
        if(availCaptures[0] == true){
          let destSquares = availCaptures[1].destSquare
          console.log("hiya",availCaptures[1])
          let sqrObjCpy = squareObj
          while (sqrObjCpy.row != this.selectedPiece.row && sqrObjCpy.row != this.selectedPiece.col){
              for(let i = 0; i < destSquares.length; i ++){
                if(destSquares[i].nextMove.row == sqrObjCpy.row && destSquares[i].nextMove.col == sqrObjCpy.col){
                  let enemyRow = destSquares[i].enemyPiece.row
                  let enemyCol = destSquares[i].enemyPiece.col
                  this.checkerSquares[enemyRow][enemyCol].hasPiece = false
                  this.checkerSquares[enemyRow][enemyCol].isKing = false
                  sqrObjCpy = destSquares[i].currentMove
                  // if(destSquares[i].nextMove.row == row && destSquares[i].nextMove.col == col ){
                  //   break
                  // }
                }
                }

          }

        }
        isValidMove = true;
      }
    }
      // Note 1: We can't check if it's one row up & dark square. Because then the piece can move to any dark square a row above it, not just the one directly diagonal to it. Which is why I added areSquaresDiagonal.
      //I deleted all my earlier spaghetti nasty code hehe xdd- kevin
    if (isValidMove){
      this.checkerSquares[row][col].hasPiece = true
      this.checkerSquares[row][col].isWhite = this.selectedPiece.isWhite;
      this.checkerSquares[row][col].isKing = this.selectedPiece.isKing;
      this.checkerSquares[row2][col2].hasPiece = false

      // Promotion
      if(row == 0){
        this.checkerSquares[row][col].isKing = true
        console.log("kinged!")
      }
    }
    else {
      return;
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

  // TODO: check if there are any available capture moves for the player. Returns true/false, as well as a list of capture Moves the user can take. Move contains a source Square and a destination Square. 
  //Notes: 
  //1. Check that the immediate upper 2  square above the current piece are empty,if empty, ignore it.
  //2. Check if the upper squares are not empty and same square.isWhite, then don't append anything
  //3.if the upper square is not empty but of different color, then suggest the move that is 2 row up from the current selected piece given that it's not empty
  //4. For cond 3, recursion may be needed so a selected piece is updated everytime everytime you reach condition 3.
  //5. base condition for recursion is check to see if 1-4 conditions all fail, then simple return [false,[]] 
  //king conditions:
  //6. if piece selected is King, extend condition 1 and condition 2 to check lower 2 squares
  //7. for condition 3, suggest 2 rows down from the current selected piece

  //[boolean, Array<Move>]
  checkCaptureMoves(selectedPiece,helperBoard,destSquare): any {
    let moves = {
      sourceSquare:selectedPiece,
      destSquare:[],
      isMoveAvail: false,
      reachedEnd: false
    }
    let upperLeftSquare = helperBoard[selectedPiece.row - 1] == undefined ? false : helperBoard[selectedPiece.row - 1][selectedPiece.col - 1]  //make sure this is not null
    let upperRightSquare = helperBoard[selectedPiece.row - 1] == undefined ? false : helperBoard[selectedPiece.row - 1][selectedPiece.col + 1] 
    let lowerLeftSquare = helperBoard[selectedPiece.row + 1] == undefined ? false : helperBoard[selectedPiece.row + 1][selectedPiece.col - 1] 
    let lowerRightSquare = helperBoard[selectedPiece.row + 1] == undefined ? false : helperBoard[selectedPiece.row + 1][selectedPiece.col + 1] 
    let upperLeftMoves = this.checkCaptureMoveHelper(selectedPiece,"ul",upperLeftSquare,helperBoard,destSquare)
    let upperRightMoves = this.checkCaptureMoveHelper(selectedPiece,"ur",upperRightSquare,helperBoard,destSquare)
    let lowerLeftMoves, lowerRightMoves
    if(selectedPiece.isKing){
       lowerLeftMoves = this.checkCaptureMoveHelper(selectedPiece,"ll",lowerLeftSquare,helperBoard,destSquare)
       lowerRightMoves =  this.checkCaptureMoveHelper(selectedPiece,"lr",lowerRightSquare,helperBoard,destSquare)
    }else{
      lowerLeftMoves = [false,[]]
      lowerRightMoves = [false,[]]
    }
    //TODO: should only concat the moves that we have use as the path for taking pieces
    // if(upperLeftMoves[1].length == 0 || upperRightMoves[1].length== 0 || lowerRightMoves.length == 0 || lowerLeftMoves.length == 0){
    //   return [moves.isMoveAvail,moves]
    // }
    if(upperLeftMoves[0]){

      moves.destSquare = moves.destSquare.concat(upperLeftMoves[1])
    }
    if(upperRightMoves[0]){
      moves.destSquare = moves.destSquare.concat(upperRightMoves[1])
    }
    if(lowerRightMoves[0]){
      moves.destSquare = moves.destSquare.concat(lowerRightMoves[1])
    }
    if(lowerLeftMoves[0]){
      moves.destSquare = moves.destSquare.concat(lowerLeftMoves[1])
    }
    if(moves.destSquare.length > 0){
      moves.isMoveAvail = true
    }
    return [moves.isMoveAvail,moves]
  }

 
  //The move object should contain {enemyPiece and Valid next move piece}
  checkCaptureMoveHelper(selectedPiece,direction,adjacentSquare,helperBoard,destSquare): [boolean,Array<Move>]{
    let move = []
    if(adjacentSquare && adjacentSquare.hasPiece == true && adjacentSquare.isWhite != selectedPiece.isWhite && adjacentSquare.traversed == false){
      let newSelectedPiece
      if(direction == "ul"){
        newSelectedPiece = helperBoard[adjacentSquare.row - 1] == null ? false :  helperBoard[adjacentSquare.row - 1][adjacentSquare.col - 1] 
      }else if(direction == "ur"){
        newSelectedPiece = helperBoard[adjacentSquare.row - 1] == null ? false :  helperBoard[adjacentSquare.row - 1][adjacentSquare.col + 1] 
      }else if(direction == "ll"){
        newSelectedPiece = helperBoard[adjacentSquare.row + 1] == null ? false :  helperBoard[adjacentSquare.row + 1][adjacentSquare.col - 1] 
      }else if(direction == "lr"){
        newSelectedPiece = helperBoard[adjacentSquare.row + 1] == null ? false :  helperBoard[adjacentSquare.row + 1][adjacentSquare.col + 1] 
      }

      if(newSelectedPiece && newSelectedPiece.hasPiece == false){ //if the square to move to is not null and is empty
        newSelectedPiece.isWhite = this.selectedPiece.isWhite //set this for recursion color purpose
        newSelectedPiece.isKing = this.selectedPiece.isKing 
          helperBoard[adjacentSquare.row][adjacentSquare.col].traversed = true //avoid duplicate for king
          //recursively look at the next sets of available moves
        let recursiveMove = this.checkCaptureMoves(newSelectedPiece,helperBoard,destSquare) 
        move.push({enemyPiece: adjacentSquare,
          nextMove: newSelectedPiece,
          currentMove:selectedPiece
        })

        console.log("egg or chicken first",recursiveMove)
        if(recursiveMove[1].isMoveAvail != false){
          for(let i = 0; i < recursiveMove[1].destSquare.length; i ++){
            move.push(recursiveMove[1].destSquare[i])
          }
        } //only return if 

          return [true,move]

      }else{
        return [false,[]]
      }
    }else{
      return [false,[]]
    }
  }

  //this function adds traversed, creates a temporary board everytime we check for capture, it helps avoid duplicate especially for king captures
  generateHelperBoard(){
    let newBoard = []
    for(let i = 0; i < this.checkerSquares.length; i ++){
      let rowList = []
      for(let j = 0; j < this.checkerSquares[i].length;j++){
        rowList.push({
          row: this.checkerSquares[i][j].row,
          col: this.checkerSquares[i][j].col,
          isEmpty: this.checkerSquares[i][j].isEmpty, //is white square or dark square
          hasPiece:this.checkerSquares[i][j].hasPiece, //check to see if this location has any piece
          isWhite: this.checkerSquares[i][j].isWhite,  // purpose is to rendar board at different location depending on the player
          isKing: this.checkerSquares[i][j].isKing, //if the piece is kinged 
          traversed: false
        })
      }
      newBoard.push(rowList)
    }
    return newBoard
  }

  // Utility functions: source https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser 
  downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  // uploadFile() {
  //   var that = this;
  //   var files = document.getElementById('selectFiles').files;
  //   console.log(files);
  //   if (files.length <= 0) {
  //     return false;
  //   }

  //   var fr = new FileReader();

  //   fr.onload = function(e) { 
  //   console.log(e);
  //     var result: Square[][] = JSON.parse(e.target.result);
  //     console.log('result', result)
  //     that.checkerSquares = result;
  //     that.dbService.updateObjectAtPath(`games/${that.gameID}/board`, that.checkerSquares)
  //   }

  //   fr.readAsText(files.item(0));
  // }

}

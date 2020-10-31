import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.page.html',
  styleUrls: ['./game-board.page.scss'],
})
//every time a player makes a move, update only one cell, set on click event on empty cell,
//capture empty cell coordinate, send the coordinate via firebase to update other player's move
//needs to populate checkerSquares by determining whether if one is black side or white side.
//
export class GameBoardPage implements OnInit {
   checkerSquares = []; 
   isPlayerWhite = true;
   isPieceSelected = false;
   selectedPiece: any;
  constructor() {
    // this.initialBlackSide();
    console.log(this.checkerSquares);
   }

  ngOnInit() {
    this.initializeBoard();
  }
  
  initializeBoard(){
    let rowMax = 8;
    let colMax = 8;
    for(let i=0; i < rowMax;i++){
      let rowList = []
      for(let j =0; j < colMax; j++){
        let row,col;
        if(this.isPlayerWhite){
          row = rowMax - 1 - i;
          col = colMax - 1 - j;
        }else{
          row = i;
          col = j;
        }
        let squareObj = {
          row: row,
          col: col,
          isEmpty: false,
          hasPiece:false,
          isWhite: this.isPlayerWhite,
          isKing: false
        };
        if((i % 2 == 0 && j % 2 == 0) || (i % 2 == 1 && j % 2 == 1)){
          squareObj.isEmpty = true;
          squareObj.hasPiece = false;
        }else{
          if(i == 4){
            squareObj.isEmpty = false;
            squareObj.hasPiece = false;
          }else if(i > 4){
            squareObj.isEmpty=false;
            squareObj.hasPiece = true;
            squareObj.isWhite = this.isPlayerWhite;
          }
          else{
            squareObj.isEmpty = false;
            squareObj.hasPiece = true;
            squareObj.isWhite = !this.isPlayerWhite;
          }
        }
        rowList.push(squareObj);
      }
      this.checkerSquares.push(rowList)
    }
  }

    selectPiece(squareObj){
      this.isPieceSelected = true;
      this.selectedPiece =squareObj
    }

  makeMove(squareObj){
    let row, col,row2,col2;
    if(this.isPlayerWhite){
      row2 = 7 - this.selectedPiece.row;
      col2 = 7 - this.selectedPiece.col;
      row = 7 - squareObj.row;
      col = 7 - squareObj.col;
    }else{
      row2 = this.selectedPiece.row;
      col2 = this.selectedPiece.col;
      row = squareObj.row;
      col = squareObj.col;
    }

    if(this.isPieceSelected && squareObj.hasPiece == false && !squareObj.isEmpty && (row2 > row || this.selectedPiece.isKing)){
      this.checkerSquares[row][col].hasPiece = true
      this.checkerSquares[row][col].isWhite = this.selectedPiece.isWhite;
      this.checkerSquares[row2][col2].hasPiece = false
    }
    console.log(squareObj)
  }

}

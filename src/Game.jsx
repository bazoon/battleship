import React, {useEffect, useState} from "react";
import Board from "./Board";
import {BattleShip, Carrier, Ship, Empty, Submarine, Cruiser, Destroyer, Interceptor} from "./ships";


const INIT = 0;
const GAME = 1;


function getRandomInt(min = 0, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const putShip = (board, ship, row, col) => {
  const cellsLeft = 10 - col;

  if (cellsLeft < ship.length) return [board, false];

  const board2 = cloneBoard(board);

  const coords = [];

  for (let i = col; i < col + ship.length; i++) {
    const cell = board2[row][i];
    const aboveCell = board2[row + 1] && board2[row + 1][i]
    const belowCell = board2[row - 1] && board2[row - 1][i]
    const leftCell = board2[row][i - 1];
    const rightCell = board2[row][i + 1];

    const failed = !cell.isEmpty ||
      (aboveCell && !aboveCell.isEmpty && aboveCell !== ship) ||
      (belowCell && !belowCell.isEmpty && belowCell !== ship) ||
      (leftCell && !leftCell.isEmpty && leftCell !== ship) ||
      (rightCell && !rightCell.isEmpty && rightCell !== ship);


    if (failed) {
      return [board, false];
    }

    board2[row][i] = ship;
    coords.push([row, i]);
  }

  ship.coords = coords;
  ship.row = row;
  ship.col = col;
  ship.isPlaced = true;
  return [board2, true];
};


const removeShip = (board, ship) => {
  const board2 = cloneBoard(board);

  ship.coords.forEach(([r, c]) => {
    board2[r][c] = new Empty();
  });

  return board2;
}


export const cloneBoard = board => {
  const b = [];

  for (let i = 0; i < 10; i++) {
    let row = []
    for (let j = 0; j < 10; j++) {
      row.push(board[i][j].clone());
    }
    b.push(row);
  }
  return b;
}

const getInitialBoard = () => {
  const initialBoard = [];
  for (let r = 0; r < 10; r++) {
    let r = []
    for (let c = 0; c < 10; c++) {
      r.push(new Empty());
    }
    initialBoard.push(r);
  }
  return initialBoard;
}

const getInitialShips = () => [
  new Carrier('c1'),
  new BattleShip('b1'),
  new Submarine('s1'),
  new Cruiser('cr1'),
  new Destroyer('d1'),
  new Interceptor('i1'),
  new Interceptor('i2'),
]

const Game = () => {
  const [humanBoard, setHumanBoard] = useState({
    board: getInitialBoard(),
    ships: getInitialShips(),
    selected: '',
  })

  const {board, ships, selected} = humanBoard;


  const tryPlaceShip = (board, ship) => {
    const row = getRandomInt(0, 9);
    const col = getRandomInt(0, 9);
    const cell = board[row][col];

    if (!cell.isEmpty) return tryPlaceShip(board, ship);

    let [newBoard, ok] = putShip(board, ship, row, col);

    if (!ok) return tryPlaceShip(board, ship);

    if (Math.random() > 0.5) {
      newBoard = removeShip(board, ship);
      ship.rotate(ship.coords[0], newBoard);
      newBoard = ship.draw(newBoard);
    }

    return newBoard;
  }

  const clear = () => {
    setHumanBoard({board: getInitialBoard(), ships: getInitialShips()});
  }

  const placeRandom = (board) => {
    let b = board;
    const ships = getInitialShips();

    ships.forEach(ship => {
      b = tryPlaceShip(b, ship);
    });

    setHumanBoard(hb => ({...hb, board: b, ships}));
  };

  useEffect(() => {
    clear();
    placeRandom(board);
  }, []);

  const setBoard = board => {
    setHumanBoard(hb => ({...hb, board}));
  }

  const setSelected = selected => {
    setHumanBoard(hb => ({...hb, selected}));
  }

  const setShips = ships => {
    setHumanBoard(hb => ({...hb, ships}));
  }

  useEffect(() => {
    const i = setInterval(() => {
      const r = getRandomInt(0, 9);
      const c = getRandomInt(0, 9);

      const cell = board[r][c];
      cell.hit(r, c);
      setHumanBoard(b => ({...b}));
    }, 100);

    return () => clearInterval(i);

  }, [board]);


  return (
    <div>
      <button onClick={_ => placeRandom(board)}>Random</button>
      <button onClick={clear}>Clear</button>
      <Board
        state={humanBoard}
        getInitialBoard={getInitialBoard}
        getInitialShips={getInitialShips}
        setBoard={setBoard}
        setSelected={setSelected}
        setShips={setShips}
      />
    </div>
  );
}

export default Game;

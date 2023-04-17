import React, {useEffect, useState} from "react";
import Board from "./Board";
import {BattleShip, Carrier, Empty, Submarine, Cruiser, Destroyer, Interceptor} from "./ships";
import EstimBoard from "./EstimBoard";

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
  // new Interceptor('i1'),
  // new Interceptor('i2'),
]


const simpleAi = (board, setBoard) => {
  const isAllHit = board.every((r, ri) => r.every((cell, ci) => {
    return cell.isHit || (cell.isAllHit && cell.isHitAt(ri, ci));
  }));

  if (isAllHit) {
    return;
  }

  const r = getRandomInt(0, 9);
  const c = getRandomInt(0, 9);

  const cell = board[r][c];

  if (cell.isHit || (cell.isHitAt && cell.isHitAt(r, c))) {
    simpleAi(board, setBoard);
  }

  cell.hit(r, c);
  setBoard(b => ({...b}));
};


const probAi = (board, setBoard, ships) => {
  const zero = 1;
  const estim = [
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
    [zero, zero, zero, zero, zero, zero, zero, zero, zero, zero],
  ];


  const getNumberOfWays = (row, col, length) => {
    let ways = 0;

    for (let i = 0; i < length; i++) {
      if (col - i >= 0) ways++
      if (col + i <= 9) ways++
    }

    for (let i = 0; i < length; i++) {
      if (row - i >= 0) ways++
      if (row + i <= 9) ways++
    }

    return ways;
  }


  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      ships.forEach(ship => {
        const ways = getNumberOfWays(row, col, ship.length);
        estim[row][col] += ways;
      });
    }
  }


  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const cell = board[row][col];
      if (cell.isHit) {
        estim[row][col] = 0;

        const left = board[row][col - 1];
        const right = board[row][col + 1];
        const top = row > 0 ? board[row - 1][col] : undefined;
        const bottom = row < 9 ? board[row + 1][col] : undefined;

        if (left) {
          estim[row][col - 1] -= 10;
        }

        if (right) {
          estim[row][col + 1] -= 10;
        }

        if (top) {
          estim[row - 1][col] -= 10;
        }

        if (bottom) {
          estim[row + 1][col] -= 10;
        }
      } else if (cell.isAllHit && cell.isAllHit(row, col)) {
        estim[row][col] = 0;

        if (row > 0) {
          estim[row - 1][col] = 0;
        }

        if (row < 9) {
          estim[row + 1][col] = 0;
        }

        if (col > 0) {
          estim[row][col - 1] = 0;
        }

        if (col < 9) {
          estim[row][col + 1] = 0;
        }
      } else if (cell.isHitAt && cell.isHitAt(row, col)) {
        estim[row][col] = 0;

        const isHit = (cell, row, col) => cell.isHit || (cell.isHitAt && cell.isHitAt(row, col));
        const isHitShip = (cell, row, col) => cell.isHitAt && cell.isHitAt(row, col);

        let isHorizontal;
        let isVertical;

        const left = board[row][col - 1];
        const right = board[row][col + 1];
        const top = row > 0 ? board[row - 1][col] : undefined;
        const bottom = row < 9 ? board[row + 1][col] : undefined;

        if (left && isHitShip(left, row, col - 1)) {
          isHorizontal = true;
        } else if (right && isHitShip(right, row, col + 1)) {
          isHorizontal = true;
        } else if (top && isHitShip(top, row - 1, col)) {
          isVertical = true;
        } else if (bottom && isHitShip(bottom, row + 1, col)) {
          isVertical = true;
        }

        if (isVertical) {
          if (row > 0) {
            if (!isHit(board[row - 1][col], row - 1, col)) {
              estim[row - 1][col] += 20;
            }
          }

          if (row < 9) {
            if (!isHit(board[row + 1][col], row + 1, col)) {
              estim[row + 1][col] += 20;
            }
          }

        } else if (isHorizontal) {

          if (col > 0) {
            if (!isHit(board[row][col - 1], row, col - 1)) {
              estim[row][col - 1] += 20;
            }
          }

          if (col < 9) {
            if (!isHit(board[row][col + 1], row, col + 1)) {
              estim[row][col + 1] += 20;
            }
          }

        } else {


          if (row > 0) {
            if (!isHit(board[row - 1][col], row - 1, col)) {
              estim[row - 1][col] += 20;
            }
          }

          if (row < 9) {
            if (!isHit(board[row + 1][col], row + 1, col)) {
              estim[row + 1][col] += 20;
            }
          }

          if (col > 0) {
            if (!isHit(board[row][col - 1], row, col - 1)) {
              estim[row][col - 1] += 20;
            }
          }

          if (col < 9) {
            if (!isHit(board[row][col + 1], row, col + 1)) {
              estim[row][col + 1] += 20;
            }
          }

        }
      }
    }
  }

  // console.table(structuredClone(estim))

  // const allEstim = estim.reduce((a, r) => {
  //   return a + r.reduce((a, e) => a + e, 0);
  // }, 0);

  const allEstim = 1;


  if (allEstim === 0) return;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      estim[row][col] /= allEstim;
    }
  }

  let maxProb = -1;
  let maxRow;
  let maxCol;


  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if (maxProb < estim[row][col]) {
        maxProb = estim[row][col];
        maxRow = row;
        maxCol = col;
      }
    }
  }

  console.log(estim)

  if (Math.random() > 0.75) {
    simpleAi(board, setBoard);
    return estim;
  }

  const cell = board[maxRow][maxCol];

  cell.hit(maxRow, maxCol);
  setBoard(b => ({...b}));
  return estim;
}



const Game = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [estim, setEstim] = useState()
  const [humanLoose, setHumanLoose] = useState(undefined);

  const [humanBoard, setHumanBoard] = useState({
    board: getInitialBoard(),
    ships: getInitialShips(),
    selected: '',
  })

  const [aiBoard, setAiBoard] = useState({
    board: getInitialBoard(),
    ships: getInitialShips(),
    selected: '',
  })

  const {board, ships, selected} = humanBoard;
  const {board: boardAi, ships: shipsAi} = aiBoard;

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

  const newGame = () => {
    clear();
    placeRandom(getInitialBoard(), setHumanBoard);
    placeRandom(getInitialBoard(), setAiBoard);
    setIsPlaying(true);
  }

  const placeRandom = (board, setBoard) => {
    let b = board;
    const ships = getInitialShips();

    ships.forEach(ship => {
      b = tryPlaceShip(b, ship);
    });

    setBoard(hb => ({...hb, board: b, ships}));
  };


  useEffect(() => {
    clear();
    placeRandom(board, setHumanBoard);
    placeRandom(boardAi, setAiBoard);
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


  const setBoardAi = board => {
    setAiBoard(ab => ({...ab, board}));
  }

  const setShipsAi = ships => {
    setAiBoard(ab => ({...ab, ships}));
  }


  // useEffect(() => {
  //   const i = setInterval(() => {
  //     const r = getRandomInt(0, 9);
  //     const c = getRandomInt(0, 9);

  //     const cell = board[r][c];
  //     cell.hit(r, c);
  //     setHumanBoard(b => ({...b}));
  //   }, 100);

  //   return () => clearInterval(i);

  // }, [board]);

  const onBoardClickAi = e => {
    let row, col;

    if (Number.isFinite(+e.target.dataset.i)) {
      row = +e.target.dataset.i;
    } else {
      row = +e.target.parentElement.dataset.i;
    }

    if (Number.isFinite(+e.target.dataset.j)) {
      col = +e.target.dataset.j;
    } else {
      col = +e.target.parentElement.dataset.j;
    }

    const cell = boardAi[row][col];

    if (cell.isHit || (cell.isHitAt && cell.isHitAt(row, col)) || !isPlaying) {
      return;
    }

    cell.hit(row, col);
    setAiBoard(b => ({...b}))
    // simpleAi(board, setHumanBoard);

    const estim = probAi(board, setHumanBoard, ships);
    setEstim(estim);

    if (isLost(ships)) {
      console.log('human looose');
      setHumanLoose(true);
      setIsPlaying(false);
    }

    if (isLost(shipsAi)) {
      console.log('AI looose');
      setHumanLoose(false);
      setIsPlaying(false);
    }
  }

  const isLost = ships => {
    return ships.every(ship => ship.isAllHit());
  }

  const runSelfGame = () => {
    newGame(board)
    setTimeout(() => {

      for (let i = 0; i < 200; i++) {
        simpleAi(boardAi, setAiBoard);
        probAi(board, setHumanBoard, ships);

        if (isLost(ships)) {
          console.log('human looose', i);
          window.arr = window.arr || [];
          window.arr.push(i);
          break;
        } else if (isLost(shipsAi)) {
          console.log('AI looose', i);
          break;
        }


      }

    }, 200);

  };

  // useEffect(() => {
  //   const id = setInterval(() => {
  //     if (isLost(ships)) {
  //       console.log('human looose');
  //       clearInterval(id);
  //     } else if (isLost(shipsAi)) {
  //       console.log('AI looose');
  //       clearInterval(id);
  //     } else {
  //       // runSelfGame();
  //     }
  //   }, 500);
  // }, [board, boardAi, ships, shipsAi]);


  // useEffect(() => {


  //   if (selfPlay) {
  //     runSelfGame();
  //   }
  // }, [selfPlay]);


  return (
    <div>
      <div className="flex justify-end mb-5">
        <div className="flex justify-center flex-1">
          {humanLoose === true && <span className="text-2xl text-white">You loose!</span>}
          {humanLoose === false && <span className="text-2xl text-white">You win!</span>}
        </div>
        <button className="bg-white p-10" onClick={_ => newGame(board)}>
          New game
        </button>
        {
          null && <button className="bg-white p-10" onClick={_ => runSelfGame()}>
            Auto battle
          </button>
        }
      </div>

      <div className="flex">
        <Board
          visible
          state={humanBoard}
          setBoard={setBoard}
          setSelected={setSelected}
          setShips={setShips}
        />

        <EstimBoard estim={estim} />
      </div>
      <div className="mb-5"></div>
      <div className="flex">
        <Board
          onBoardClick={onBoardClickAi}
          state={aiBoard}
          setBoard={setBoardAi}
          setShips={setShipsAi}
        />
      </div>
    </div>
  );
}

export default Game;

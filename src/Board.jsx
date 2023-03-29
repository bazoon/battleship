import React, {useEffect, useState} from "react";
import {BattleShip, Carrier, Ship, Empty, Submarine, Cruiser, Destroyer, Interceptor} from "./ships";


const cellCls = `border border-solid border-stone-500 w-[60px] h-[60px]
  border-collapse
`;

const Cell = ({cell, i, j}) => {
  const cls = `flex justify-center items-center ${cellCls} ${cell.isEmpty ? '' : cell.cls}`
  const hit = !cell.isEmpty && cell.hits.some(([r, c]) => r === i && c === j);
  return (
    <div className={cls} data-i={i} data-j={j}>{hit ? 'X' : ''}</div>
  );
}

const Board = ({
  state,
  setSelected,
  setBoard,
  getInitialBoard,
  setShips,
  getInitialShips
}) => {
  const {board, selected, ships} = state;

  const renderRow = (row, i) => {
    return row.map((cell, j) => <Cell i={i} j={j} key={cell.getId ? cell.getId() : cell.id} cell={cell} />);
  };

  const renderAvailable = () => {
    return (
      <div>
        {
          ships.filter(s => !s.isPlaced).map(ship => ship.renderPreview(setSelected, selected))
        }
      </div>
    )
  };

  const onBoardClick = e => {
    const i = +e.target.dataset.i;
    const j = +e.target.dataset.j;

    if (selected) {
      const [newBoard, ok] = putShip(board, selected, i, j);
      if (ok) {
        setBoard(newBoard);
        setSelected('');
      }
    }
  };

  const onBoardDblClick = e => {
    const i = +e.target.dataset.i;
    const j = +e.target.dataset.j;
    const ship = board[i][j];

    if (!(ship instanceof Ship)) {
      return;
    }

    const board2 = removeShip(board, ship);
    ship.rotate([i, j], board);
    const board3 = ship.draw(board2);
    setBoard(board3);
  }

  return (
    <div>
      <div className="flex">
        <div className="board grid grid-cols-10 w-[600px]" onClick={onBoardClick} onDoubleClick={onBoardDblClick}>
          {
            board.map(renderRow)
          }
        </div>
        <div className="ships ml-20">
          {renderAvailable()}
        </div>
      </div>
    </div>
  );
};

export default Board;

import React from "react";
import cn from 'classnames';

const cellCls = `border border-solid border-stone-500 w-[60px] h-[60px]
  border-collapse flex justify-center items-center
`;

const Cell = ({cell, i, j, visible}) => {
  const hit = (!cell.isEmpty && cell.hits.some(([r, c]) => r === i && c === j)) || cell.isHit;
  const cls = cn(cellCls, {
    [cell.cls]: visible || hit,
  });

  const x = <span className="text-white text-2xl">❌</span>

  return (
    <div className={cls} data-i={i} data-j={j}>{hit ? x : ''}</div>
  );
}


const Board = ({
  state,
  setSelected,
  visible,
  onBoardClick
}) => {
  const {board, selected, ships} = state;

  const renderRow = (row, i) => {
    return row.map((cell, j) => {
      const key = cell.getId ? cell.getId() : cell.id;
      return <Cell i={i} j={j} visible={visible} key={key} cell={cell} />
    });
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

  // const onBoardClick = e => {
  //   const i = +e.target.dataset.i;
  //   const j = +e.target.dataset.j;

  //   if (selected) {
  //     const [newBoard, ok] = putShip(board, selected, i, j);
  //     if (ok) {
  //       setBoard(newBoard);
  //       setSelected('');
  //     }
  //   }
  // };

  // const onBoardDblClick = e => {
  //   const i = +e.target.dataset.i;
  //   const j = +e.target.dataset.j;
  //   const ship = board[i][j];

  //   if (!(ship instanceof Ship)) {
  //     return;
  //   }

  //   const board2 = removeShip(board, ship);
  //   ship.rotate([i, j], board);
  //   const board3 = ship.draw(board2);
  //   setBoard(board3);
  // }

  return (
    <div>
      <div className="flex">
        <div className="board grid grid-cols-10 w-[600px]" onClick={onBoardClick}>
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

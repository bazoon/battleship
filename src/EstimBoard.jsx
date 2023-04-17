import React from "react";
import cn from 'classnames';

const cellCls = `w-[60px] h-[60px]
  border-collapse flex justify-center items-center
`;

const Cell = ({cell, i, j, }) => {
  const cls = cn(cellCls, {
  });

  const x = <span className="text-orange-400">X</span>

  return (
    <div className={cls} style={{background: `rgb(${cell * 2}, ${cell / 2}, ${cell / 2})`}}></div>
  );
}


const EstimBoard = ({
  estim
}) => {
  const renderRow = (row, i) => {
    return row.map((cell, j) => {
      const key = i + '-' + j
      return <Cell i={i} j={j} key={key} cell={cell} />
    });
  };


  return (
    <div>
      <div className="flex">
        <div className="board grid grid-cols-10 w-[600px]">
          {
            estim && estim.map(renderRow)
          }
        </div>
      </div>
    </div>
  );
};

export default EstimBoard;

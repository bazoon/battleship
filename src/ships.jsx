import cn from 'classnames';
import {cloneBoard} from './Game';

const selectedShipCls = 'border-2 border-solid border-red-600';
const shipCls = 'bg-green-600 w-[60px] h-[60px]'

function rotatePoint(point, center, angle) {
  angle = (angle) * (Math.PI / 180); // Convert to radians
  var rotatedX = Math.cos(angle) * (point[0] - center[0]) - Math.sin(angle) * (point[1] - center[1]) + center[0];
  var rotatedY = Math.sin(angle) * (point[0] - center[0]) + Math.cos(angle) * (point[1] - center[1]) + center[1];
  return [Math.round(rotatedX), Math.round(rotatedY)];
}

export class Empty {
  constructor() {
    this.id = 'id' + Math.random();
    this.isEmpty = true;
  }

  hit() {
    this.isHit = true;
  }

  clone() {
    const empty = new Empty();
    empty.id = this.id;
    empty.isEmpty = true;
    empty.isHit = this.isHit;
    return empty;
  }
};

export class Ship {
  constructor(length) {
    this.length = length;
    this.coords = [];
    this.isPlaced = false;
    this.hits = [];
  }

  rotate(point, board) {
    const coords = this.coords.map(p => rotatePoint(p, point, -90));
    const goodCoords = coords.every(([r, c]) => {
      const inside = r >= 0 && r <= 9 && c >= 0 && c <= 9;
      if (!inside) return false;
      const cell = board[r][c];
      if (!(cell?.isEmpty || cell?.id === this.id)) return false;

      const aboveCell = board[r + 1] && board[r + 1][c]
      const belowCell = board[r - 1] && board[r - 1][c]
      const leftCell = board[r][c - 1];
      const rightCell = board[r][c + 1];

      const failed =
        (aboveCell && !aboveCell.isEmpty && aboveCell.id !== this.id) ||
        (belowCell && !belowCell.isEmpty && belowCell.id !== this.id) ||
        (leftCell && !leftCell.isEmpty && leftCell.id !== this.id) ||
        (rightCell && !rightCell.isEmpty && rightCell.id !== this.id);

      return !failed;
    })

    if (!goodCoords) return;


    this.coords = coords;
  }

  draw(board) {
    const board2 = cloneBoard(board);

    this.coords.forEach(([r, c]) => {
      board2[r][c] = this;
    });

    return board2;
  }

  make() {
    return new Ship();
  }

  isHitAt = (row, col) => {
    return this.hits.some(([r, c]) => r === row && c === col);
  }

  hit(row, col) {
    const isHit = this.coords.some(([r, c]) => r === row && c === col);
    const isAlready = this.hits.some(([r, c]) => r === row && c === col);

    if (isHit && !isAlready) {
      this.hits.push([row, col]);
    }
  }

  isAllHit() {
    return this.hits.length === this.length;
  }

  renderPreview = (setSelected, selected) => {
    const cls = cn('w-fit flex mb-2', {
      [selectedShipCls]: selected === this
    });

    const boxes = [];

    for (let i = 0; i < this.length; i++) {
      boxes.push(<div key={i} className={shipCls} />)
    }

    return (
      <div className={cls} key={this.getId()} onClick={_ => setSelected(this)}>
        {
          boxes.map(b => b)
        }
      </div>
    );
  }

  clone() {
    const c = this.make();
    c.length = this.length;
    c.row = this.row;
    c.col = this.col;
    c.coords = this.coords;
    c.id = this.id;
    c.cls = this.cls;
    c.hits = this.hits;
    return c;
  }

  getId() {
    return Math.random()
  }
}

export class Carrier extends Ship {
  constructor(id) {
    super(5);
    this.id = id;
    this.cls = 'bg-green-600 w-[60px] h-[60px]';
  }

  make() {
    return new Carrier();
  }

}

export class BattleShip extends Ship {
  constructor(id) {
    super(4);
    this.id = id;
    this.cls = 'bg-yellow-600 w-[60px] h-[60px]';
  }

  make() {
    return new BattleShip();
  }

}


export class Submarine extends Ship {
  constructor(id) {
    super(3);
    this.id = id;
    this.cls = 'bg-cyan-600 w-[60px] h-[60px]';
  }

  make() {
    return new Submarine();
  }
}


export class Cruiser extends Ship {
  constructor(id) {
    super(3);
    this.id = id;
    this.cls = 'bg-blue-600 w-[60px] h-[60px]';
  }

  make() {
    return new Cruiser();
  }
}

export class Destroyer extends Ship {
  constructor(id) {
    super(2);
    this.id = id;
    this.cls = 'bg-orange-600 w-[60px] h-[60px]';
  }

  make() {
    return new Destroyer();
  }
}



export class Interceptor extends Ship {
  constructor(id) {
    super(1);
    this.id = id;
    this.cls = 'bg-cyan-600 w-[60px] h-[60px]';
  }

  make() {
    return new Destroyer();
  }
}




import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

interface SquareProps {
  value: string;
  onClick: () => void;
  highlight: boolean;
}

function Square(props: SquareProps) {
  const className = "square" + (props.highlight ? " highlight" : "");

  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

interface BoardProps {
  squares: Array<string>;
  onClick: (i: number) => void;
  winLine?: Array<number>;
}

class Board extends React.Component<BoardProps> {
  renderSquare(i: number) {
    const highlight = this.props.winLine
      ? this.props.winLine.includes(i)
      : false;

    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={highlight}
      />
    );
  }

  render() {
    const boardSize = 3;
    let board = [];

    for (let rowIdx = 0; rowIdx < boardSize; rowIdx++) {
      let row = [];
      for (let colIdx = 0; colIdx < boardSize; colIdx++) {
        row.push(this.renderSquare(rowIdx * boardSize + colIdx));
      }
      board.push(
        <div key={rowIdx} className="board-row">
          {row}
        </div>
      );
    }

    return <div>{board}</div>;
  }
}

interface GameProps {}

interface GameHistoryEntry {
  squares: Array<string>;
  lastClickedSquare?: number;
}

interface GameState {
  history: Array<GameHistoryEntry>;
  stepNumber: number;
  xIsNext: boolean;
  movesDescending: boolean;
}

class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      movesDescending: false,
    };
  }

  handleClick(i: number) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastClickedSquare: i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleSortClick() {
    this.setState({
      movesDescending: !this.state.movesDescending,
    });
  }

  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winInfo = calculateWinner(current.squares);

    const moves = history.map((historyEntry, moveNo) => {
      let desc = "";
      if (historyEntry.lastClickedSquare) {
        const lastCol = 1 + (historyEntry.lastClickedSquare % 3);
        const lastRow = 1 + Math.floor(historyEntry.lastClickedSquare / 3);
        desc = `Go to move #${moveNo} (${lastCol}, ${lastRow})`;
      } else {
        desc = "Go to game start";
      }

      return (
        <li key={moveNo}>
          <button onClick={() => this.jumpTo(moveNo)}>
            {moveNo === this.state.stepNumber ? <b>{desc}</b> : desc}
          </button>
        </li>
      );
    });

    let status;
    if (winInfo.winner) {
      status = "Winner: " + winInfo.winner;
    } else {
      status = "Next player " + (this.state.xIsNext ? "X" : "O");
    }

    if (this.state.movesDescending) {
      moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winLine={winInfo.winLine}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.handleSortClick()}>
            {(this.state.movesDescending ? "Descending" : "Ascending") +
              " Order"}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

interface WinInfo {
  winner?: string;
  winLine?: Array<number>;
}

function calculateWinner(squares: Array<string>): WinInfo {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winLine: lines[i],
      };
    }
  }

  if (squares.every((square) => square)) {
    return {
      winner: "Draw",
      winLine: undefined,
    };
  }

  return {
    winner: undefined,
    winLine: undefined,
  };
}

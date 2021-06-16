import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  const className = "square" + (props.highlight ? " highlight" : "");

  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={this.props.winLine && this.props.winLine.includes(i)}
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

class Game extends React.Component {
  constructor(props) {
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

  handleClick(i) {
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

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winInfo = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const lastCol = 1 + (step.lastClickedSquare % 3);
      const lastRow = 1 + Math.floor(step.lastClickedSquare / 3);

      const desc = move
        ? `Go to move #${move} (${lastCol}, ${lastRow})`
        : "Go to game start";

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <b>{desc}</b> : desc}
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

function calculateWinner(squares) {
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
      winLine: null,
    };
  }

  return {
    winner: null,
    winLine: null,
  };
}

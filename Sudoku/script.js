// 🔁 Shuffle helper
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ✅ Generate a full 6x6 Sudoku solution (with valid 2x3 boxes)
function generateFullSolution() {
  const base = [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 1, 5, 6, 4],
    [5, 6, 4, 2, 3, 1],
    [3, 1, 2, 6, 4, 5],
    [6, 4, 5, 3, 1, 2],
  ];

  // Randomize rows and columns while preserving 2x3 boxes
  const rowBlocks = [[0, 1], [2, 3], [4, 5]];
  const colBlocks = [[0, 1, 2], [3, 4, 5]];

  const shuffledRows = rowBlocks.flatMap(block => shuffle([...block]));
  const shuffledCols = colBlocks.flatMap(block => shuffle([...block]));

  const shuffledGrid = [];
  for (let i = 0; i < 6; i++) {
    shuffledGrid[i] = [];
    for (let j = 0; j < 6; j++) {
      shuffledGrid[i][j] = base[shuffledRows[i]][shuffledCols[j]];
    }
  }

  return shuffledGrid;
}

const fullSolution = generateFullSolution();
console.table(fullSolution);
// 🔲 Create puzzle with max 2 prefilled cells per row
const puzzle = fullSolution.map(row => {
  const newRow = [...row];
  const indicesToRemove = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 4); // Remove 4, leave 2
  indicesToRemove.forEach(i => newRow[i] = 0);
  return newRow;
});

function renderGrid() {
  const grid = document.getElementById("sudokuGrid");
  grid.innerHTML = '';

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const cell = document.createElement("input");
      cell.classList.add("cell");

      // Add thick borders for 2x3 boxes
      if (row % 2 === 0) cell.classList.add("thick-top");
      if (col % 3 === 0) cell.classList.add("thick-left");
      if (row === 5) cell.classList.add("thick-bottom");
      if (col === 5) cell.classList.add("thick-right");

      cell.dataset.row = row;
      cell.dataset.col = col;

      const value = puzzle[row][col];
      if (value === 0) {
        cell.type = "number";
        cell.min = 1;
        cell.max = 6;
      } else {
        cell.type = "text";
        cell.value = value;
        cell.disabled = true;
      }

      grid.appendChild(cell);
    }
  }
}


function checkAnswers() {
  const result = document.getElementById("result");
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => cell.classList.remove("invalid"));

  // Build user grid
  const userGrid = [];
  for (let r = 0; r < 6; r++) {
    userGrid[r] = [];
    for (let c = 0; c < 6; c++) {
      const input = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
      const val = parseInt(input.value);
      userGrid[r][c] = isNaN(val) ? 0 : val;
    }
  }

  let isValid = true;

  // ✅ Validate rows
  for (let r = 0; r < 6; r++) {
    const seen = new Set();
    for (let c = 0; c < 6; c++) {
      const val = userGrid[r][c];
      if (val < 1 || val > 6 || seen.has(val)) {
        markInvalidRow(r);
        isValid = false;
        break;
      }
      seen.add(val);
    }
  }

  // ✅ Validate columns
  for (let c = 0; c < 6; c++) {
    const seen = new Set();
    for (let r = 0; r < 6; r++) {
      const val = userGrid[r][c];
      if (val < 1 || val > 6 || seen.has(val)) {
        markInvalidCol(c);
        isValid = false;
        break;
      }
      seen.add(val);
    }
  }

  // ✅ Validate 2x3 boxes
  const boxStarts = [
    [0, 0], [0, 3],
    [2, 0], [2, 3],
    [4, 0], [4, 3]
  ];

  for (const [startRow, startCol] of boxStarts) {
    const seen = new Set();
    let boxValid = true;

    for (let r = startRow; r < startRow + 2; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        const val = userGrid[r][c];
        if (val < 1 || val > 6 || seen.has(val)) {
          boxValid = false;
          isValid = false;
        }
        seen.add(val);
      }
    }

    if (!boxValid) {
      markInvalidBox(startRow, startCol);
    }
  }

  // isValid = true
  if (isValid) {
    result.textContent = "✅ Correct! Well done.";
    result.style.color = "green";
    showClue();
    
  } else {
    result.textContent = "❌ Invalid entries. Check ed cells.";
    result.style.color = "red";
  }
}

function markInvalidRow(row) {
  for (let c = 0; c < 6; c++) {
    const input = document.querySelector(`input[data-row="${row}"][data-col="${c}"]`);
    if (!input.disabled) input.classList.add("invalid");
  }
}

function markInvalidCol(col) {
  for (let r = 0; r < 6; r++) {
    const input = document.querySelector(`input[data-row="${r}"][data-col="${col}"]`);
    if (!input.disabled) input.classList.add("invalid");
  }
}

function markInvalidBox(startRow, startCol) {
  for (let r = startRow; r < startRow + 2; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      const input = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
      if (!input.disabled) input.classList.add("invalid");
    }
  }
}

renderGrid();


function showClue(){
  document.querySelector('html').innerHTML = `
<head>
  <meta charset="UTF-8" />
  <title>Treasure Puzzle</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f0f4f8;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }

    .puzzle {
      background: url('https://www.transparenttextures.com/patterns/old-mathematics.png');
      background-color: #fff8dc;
      border: 3px solid black;
      padding: 30px;
      max-width: 100%;
      width: 500px;
      text-align: center;
      border-radius: 12px;
      box-sizing: border-box;
    }

    h2 {
      font-family: 'Courier New', Courier, monospace;
      color: black;
      font-size: 20px;
      margin-bottom: 20px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 5px;
      justify-content: center;
    }

    .cell {
      aspect-ratio: 1 / 1;
      background-color: #ffffff;
      border: 2px solid #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      font-size: 15px;
      color: #333;
    }

    // .highlight {
    //   background-color: #ffd54f;
    //   border-color: #fbc02d;
    //   color: #000;
    // }

    @media (max-width: 400px) {
      .puzzle {
        padding: 20px;
        width: 100%;
      }
      .cell {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>

  <div class="puzzle">
    <h2>
      🔍 Within this mysterious grid lies the name of the one who holds the prize.<br>
      Find them, ask them, and the treasure shall be yours.<br>
      Can you uncover the hidden name?
    </h2>

    <div class="grid">
      <!-- Row 1 -->
      <div class="cell">F</div><div class="cell">L</div><div class="cell">G</div><div class="cell">V</div><div class="cell">C</div><div class="cell">S</div><div class="cell">Q</div><div class="cell">N</div>
      <!-- Row 2 -->
      <div class="cell">B</div><div class="cell">Z</div><div class="cell highlight">A</div><div class="cell">D</div><div class="cell">U</div><div class="cell">M</div><div class="cell">E</div><div class="cell">Y</div>
      <!-- Row 3 -->
      <div class="cell">T</div><div class="cell">P</div><div class="cell highlight">S</div><div class="cell">E</div><div class="cell">O</div><div class="cell">X</div><div class="cell">C</div><div class="cell">L</div>
      <!-- Row 4 -->
      <div class="cell">N</div><div class="cell">R</div><div class="cell highlight">K</div><div class="cell highlight">F</div><div class="cell">T</div><div class="cell">N</div><div class="cell">W</div><div class="cell">H</div>
      <!-- Row 5 -->
      <div class="cell">I</div><div class="cell">Q</div><div class="cell">J</div><div class="cell highlight">A</div><div class="cell">Z</div><div class="cell">B</div><div class="cell">K</div><div class="cell">G</div>
      <!-- Row 6 -->
      <div class="cell">V</div><div class="cell">A</div><div class="cell">J</div><div class="cell highlight">I</div><div class="cell highlight">R</div><div class="cell">T</div><div class="cell">C</div><div class="cell">B</div>
      <!-- Row 7 -->
      <div class="cell">U</div><div class="cell">F</div><div class="cell">T</div><div class="cell">U</div><div class="cell highlight">I</div><div class="cell">D</div><div class="cell">U</div><div class="cell">O</div>
      <!-- Row 8 -->
      <div class="cell">E</div><div class="cell">M</div><div class="cell">D</div><div class="cell">W</div><div class="cell highlight">N</div><div class="cell">Y</div><div class="cell">S</div><div class="cell">R</div>
    </div>
  </div>

</body>
</head>
  `
}
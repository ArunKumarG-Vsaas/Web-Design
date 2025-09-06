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

  if (isValid) {
    result.textContent = "✅ Correct! Well done.";
    result.style.color = "green";
  } else {
    result.textContent = "❌ Invalid entries. Check highlighted cells.";
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

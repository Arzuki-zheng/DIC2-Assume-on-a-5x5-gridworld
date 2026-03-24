document.addEventListener('DOMContentLoaded', () => {
    const sizeInput = document.getElementById('grid-size');
    const btnGenerate = document.getElementById('btn-generate');
    const gridContainer = document.getElementById('grid-container');
    const statusMessage = document.getElementById('status-message');
    const actionButtons = document.getElementById('action-buttons');
    const btnEvalRandom = document.getElementById('btn-eval-random');
    const btnValueIter = document.getElementById('btn-value-iter');
    const btnReset = document.getElementById('btn-reset');

    let n = 5;
    let grid = [];
    let state = 'INIT'; // INIT, START, END, OBSTACLE, READY
    let startPos = null;
    let endPos = null;
    let obstacles = [];
    let maxObstacles = 0;

    // FontAwesome classes for arrows
    // 0: LEFT, 1: RIGHT, 2: UP, 3: DOWN
    const actionIcons = {
        0: 'fa-solid fa-arrow-left',
        1: 'fa-solid fa-arrow-right',
        2: 'fa-solid fa-arrow-up',
        3: 'fa-solid fa-arrow-down'
    };

    btnGenerate.addEventListener('click', () => {
        let val = parseInt(sizeInput.value);
        if (isNaN(val) || val < 5 || val > 9) {
            alert('Please enter a number between 5 and 9');
            return;
        }
        n = val;
        maxObstacles = n - 2;
        initGrid();
    });

    btnReset.addEventListener('click', initGrid);

    function initGrid() {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${n}, 60px)`;
        gridContainer.style.gridTemplateRows = `repeat(${n}, 60px)`;
        
        startPos = null;
        endPos = null;
        obstacles = [];
        grid = [];
        
        for (let r = 0; r < n; r++) {
            let row = [];
            for (let c = 0; c < n; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                cell.addEventListener('click', () => handleCellClick(r, c, cell));
                
                gridContainer.appendChild(cell);
                row.push(cell);
            }
            grid.push(row);
        }
        
        state = 'START';
        updateStatus();
        actionButtons.style.display = 'none';
    }

    function handleCellClick(r, c, cell) {
        if (state === 'START') {
            startPos = [r, c];
            cell.classList.add('start');
            cell.innerHTML = '<span style="font-size: 11px; font-weight: bold; color: white;">START</span>';
            state = 'END';
            updateStatus();
        } 
        else if (state === 'END') {
            if (r === startPos[0] && c === startPos[1]) return; // Cannot be same as start
            endPos = [r, c];
            cell.classList.add('end');
            cell.innerHTML = '<span style="font-size: 11px; font-weight: bold; color: white;">END</span>';
            state = 'OBSTACLE';
            updateStatus();
        }
        else if (state === 'OBSTACLE') {
            // Check if already start, end or obstacle
            if ((r === startPos[0] && c === startPos[1]) || 
                (r === endPos[0] && c === endPos[1])) {
                return;
            }
            
            // Check if already an obstacle
            const obsIndex = obstacles.findIndex(obs => obs[0] === r && obs[1] === c);
            if (obsIndex > -1) {
                // Remove obstacle
                obstacles.splice(obsIndex, 1);
                cell.classList.remove('obstacle');
            } else {
                if (obstacles.length < maxObstacles) {
                    obstacles.push([r, c]);
                    cell.classList.add('obstacle');
                }
            }
            
            if (obstacles.length === maxObstacles) {
                state = 'READY';
                actionButtons.style.display = 'flex';
            }
            updateStatus();
        }
    }

    function updateStatus() {
        switch(state) {
            case 'START':
                statusMessage.textContent = 'Step 1: Click on a cell to set the START position (Green)';
                break;
            case 'END':
                statusMessage.textContent = 'Step 2: Click on a cell to set the END position (Red)';
                break;
            case 'OBSTACLE':
                let remaining = maxObstacles - obstacles.length;
                statusMessage.textContent = `Step 3: Click generic cells to add ${maxObstacles} obstacles (Remaining: ${remaining})`;
                break;
            case 'READY':
                statusMessage.textContent = 'Configuration complete! Choose an action below.';
                break;
        }
    }

    function drawResults(result) {
        const values = result.values;
        const policy = result.policy;
        
        let i = 0;
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = grid[r][c];
                const val = values[r][c];
                const pol = policy[i];
                i++;
                
                // Clear old values and arrows but keep Start/End labels
                let isStart = cell.classList.contains('start');
                let isEnd = cell.classList.contains('end');
                
                cell.innerHTML = '';
                
                if (pol === -2) {
                    // Obstacle, do nothing
                    continue;
                }
                
                if (isStart) {
                    cell.innerHTML += '<div style="font-size: 10px; font-weight: bold; position: absolute; top: 2px; color: white;">START</div>';
                }
                if (isEnd) {
                    cell.innerHTML += '<div style="font-size: 10px; font-weight: bold; position: absolute; top: 2px; color: white;">END</div>';
                }
                
                if (pol >= 0 && pol <= 3) {
                    cell.innerHTML += `<i class="${actionIcons[pol]} cell-arrow"></i>`;
                }

                // Append value conditionally formatting to two decimal places
                if (!isEnd && pol !== -2) {
                    let formattedVal = Number.isInteger(val) ? val : parseFloat(val).toFixed(2);
                    cell.innerHTML += `<div class="cell-value">${formattedVal}</div>`;
                } else if (isEnd) {
                    cell.innerHTML += `<div class="cell-value" style="color: white;">${parseFloat(val).toFixed(2)}</div>`;
                }
            }
        }
    }

    async function callApi(endpoint) {
        btnEvalRandom.disabled = true;
        btnValueIter.disabled = true;
        statusMessage.textContent = 'Computing...';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    n: n,
                    obstacles: obstacles,
                    end: endPos
                })
            });

            if (!response.ok) {
                throw new Error('Network error');
            }

            const data = await response.json();
            drawResults(data);
            statusMessage.textContent = 'Results computed and displayed successfully.';

        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = 'An error occurred during computation.';
        } finally {
            btnEvalRandom.disabled = false;
            btnValueIter.disabled = false;
        }
    }

    btnEvalRandom.addEventListener('click', () => {
        callApi('/api/evaluate_random');
    });

    btnValueIter.addEventListener('click', () => {
        callApi('/api/value_iteration');
    });
});

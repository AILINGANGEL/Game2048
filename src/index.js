import './styles/index.less';
class Game {
    constructor(Grid){
        this.grid = new Grid;
        this.setup();
    }
    initGame(){
        // 生成2个cell
        
    }
    setup(){
        this.grid.addCell();
        this.grid.addCell();
    }
}

class Grid {
    constructor() {
        this.domManager = new DomManager();
        this.size = 4;
        this.grid = [];
        for(let i = 0; i < this.size; i++) {
            let row = [];
            for(let j = 0; j < this.size; j++) {
                row.push(null);
            }
            this.grid.push(row);
        }
    }
    getAvailablePosition(){
        // 所有所有没有被占用的格子
        let unoccupiedCells = [];
        for(let i = 0; i < this.size; i ++) {
            for(let j = 0; j < this.size; j++) {
                if(this.grid[i][j] === null) {
                    unoccupiedCells.push({
                        x: i,
                        y: j,
                    });
                }
            }
        }
        return unoccupiedCells;
    }
    getRandomPosition(){
        // 从可选的cell中随机选一个cell
        let emptyPos = this.getAvailablePosition();
        if(!!emptyPos.length) {
            let randomIndex = Math.floor(Math.random()*emptyPos.length);
            return emptyPos[randomIndex];
        }
        return null;
    }
    updateGrid(cell) {
        this.grid[cell.x][cell.y] = cell;
    }
    addCell() {
        let positon = this.getRandomPosition();
        console.log(positon);
        if(positon) {
            let value = Math.random() > 0.5 ? 4: 2;
            let cell = new Cell(positon, value);
            this.domManager.addCell(cell);
            this.updateGrid(cell);
        }
    }
}

class Cell {
    constructor(position, value) {
        this.x = position.x;
        this.y = position.y;
        this.value = value;
    }
}

class DomManager {
    constructor() {
        this.gridContainer = document.querySelector('.container');
    }
    addCell(cell){
        const div = document.createElement('div');
        div.setAttribute('class', `cell-${cell.value} cell-${cell.x}-${cell.y}`);
        div.textContent = cell.value;
        this.gridContainer.appendChild(div);
    }
}

new Game(Grid);
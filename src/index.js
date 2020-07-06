import './styles/index.less';
class Game {
    constructor(Grid){
        this.grid = new Grid;
        this.startCellNums = 2;
        this.setup();
    }
    createStartCells(){
       for(let i = 0; i < this.startCellNums; i++) {
           this.grid.addRandomCell();
       }
    }
    setup(){
       this.over = false;
       this.win = false;
       this.createStartCells();
       window.addEventListener('keydown', this.move.bind(this));
    }
    move(event){
        // 移动格子
        if(event.keyCode < 37 || event.keyCode > 40) return;
        const direction = this.getMoveDirection(event.keyCode);
        const vector = this.getVector(direction);
        const tranverse = this.buildTranverse(direction);
        tranverse.x.forEach(row=>{
            tranverse.y.forEach(col=>{
                const cell = this.grid.getCell({x: row, y: col});
                if(cell) {
                    console.log('cell=>', cell);
                    // 获取当前格子下次移动的最远距离
                    const farthest = this.getCellFarthestPostion(cell, vector);
                    // 最终的位置的下一个位置
                    const nextCellPos = this.getNextCellPos(farthest, vector);
                    console.log('farthest=>', farthest);
                    console.log('newCellPos=>', nextCellPos);
                    if(nextCellPos) {
                        const nextCell = this.grid.getCell(nextCellPos);
                        console.log('nextCell=>', nextCell);
                        if(nextCell && nextCell.value === cell.value && !nextCell.isMerged) {
                            const newCell = new Cell(nextCellPos, nextCell.value * 2, true);
                            this.grid.removeCell(cell);
                            this.grid.removeCell(nextCell);
                            this.grid.addCell(newCell);
                            if(newCell.value === 16) {
                                this.win = true;
                            }
                        } else {
                            this.grid.updateCellPos(cell, farthest);
                        }
                    } else {
                       this.grid.updateCellPos(cell, farthest);
                    }
                }
            });
        });
        this.grid.update(direction);
        this.grid.addRandomCell();
        if(this.grid.isFull() && this.grid.cannotMove()) {
            this.over = true;
        }
        console.log('over=>', this.over);
        console.log('win=>', this.win)
    }
    getMoveDirection(code) {
        if(code === 37) {
            return 'left';
        } else if (code === 38) {
            return 'up';
        } else if (code === 39) {
            return 'right';
        } else if (code === 40) {
            return 'down';
        }
    }
    getVector(direction) {
        switch (direction) {
            case 'left' :
                return {x: 0, y : -1};
            case 'right':
                return {x: 0, y: 1};
            case 'up':
                return {x: -1, y: 0};
            case 'down': 
                return {x: 1, y: 0};
        }
    }
    buildTranverse(direction) {
        // 根据按键的方向构建要便利的行或者列的顺序
        const tranverse={x:[], y:[]};
        for(let i = 0; i < this.grid.size; i++) {
            tranverse.x.push(i);
            tranverse.y.push(i);
        }
        // 如果向右就从后面开始遍历
        if(direction === 'right') {
            tranverse.y.reverse();
        }
        // 如果向下面开始遍历
        if(direction === 'down') {
            tranverse.x.reverse();
        }
        return tranverse;
    }
    getCellFarthestPostion(cell, vector){
        let ans = {x: cell.x, y: cell.y};
        let farthest = {x: cell.x + vector.x, y: cell.y + vector.y};
        while(this.grid.isValidPos(farthest) && this.grid.isPosAvailabel(farthest)) {
            ans.x = farthest.x;
            ans.y = farthest.y;
            farthest.x += vector.x;
            farthest.y += vector.y;
        }
        return ans;
    }
    getNextCellPos(cell ,vector) {
        let next = {
            x: cell.x + vector.x,
            y: cell.y + vector.y
        }
        if(this.grid.isValidPos(next)) {
            return next;
        }
        return null;
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
    getCell(pos) {
        return this.grid[pos.x][pos.y] || null;
    }
    addCell(cell) {
        this.grid[cell.x][cell.y] = cell;
        this.domManager.addCell(cell);
    }
    addRandomCell() {
        let positon = this.getRandomPosition();
        if(positon) {
            let value = Math.random() > 0.5 ? 4: 2;
            let cell = new Cell(positon, value);
            this.domManager.addCell(cell);
            this.addCell(cell);
        }
    }
    removeCell(cell) {
        this.grid[cell.x][cell.y] = null;
    };
    updateCellPos(cell, newPos) {
        this.grid[cell.x][cell.y] = null;
        cell.updatePosition(newPos);
        this.grid[newPos.x][newPos.y] = cell
    }
    isPosAvailabel(pos) {
        return this.grid[pos.x][pos.y] === null;
    }
    isValidPos(pos) {
        return pos.x >=0 && pos.x < this.size && pos.y>=0 && pos.y < this.size;
    }
    update(){
        // 根据grid里存的内容，更新整个布局
        this.grid.forEach(row=>{
            row.forEach(cell=>{
                if(cell) {
                    cell.setToUnMerged();
                }
            })
        });
        this.domManager.clearAll();
        this.domManager.updateAll(this.grid);
    }
    isFull(){
        for(let i = 0; i < this.grid.length; i++) {
            for(let j = 0; j < this.grid[i].length; j++){
                if(this.grid[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    cannotMove(){
        // 每个格子只需要和自己右边以及下边的格子进行对比;
        for(let i = 0; i < this.grid.length - 1; i++) {
            for(let j = 0; j < this.grid[i].length -1; j++){
                if(this.grid[i][j] === null || this.grid[i][j].value === this.grid[i][j+1].value || this.grid[i][j].value === this.grid[i+1][j].value) {
                    return false;
                }
            }
        }
        return true;
    }
}

class Cell {
    constructor(position, value, isMerged=false) {
        this.x = position.x;
        this.y = position.y;
        this.value = value;
        
        // 该格子是合并得到的吗
        this.isMerged = isMerged;
    }
    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    }
    setToUnMerged() {
        this.isMerged = false;
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
    clearAll(){
        this.gridContainer.innerHTML = '';
    }
    updateAll(grid){
        grid.forEach(row=> {
            row.forEach(cell=>{
                if(cell !== null) {
                    this.addCell(cell);
                }
            });
        });
    }
}

new Game(Grid);
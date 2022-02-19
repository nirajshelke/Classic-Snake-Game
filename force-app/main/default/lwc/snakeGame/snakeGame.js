import { LightningElement, track } from 'lwc';

export default class SnakeGame extends LightningElement {
    score=0;
    blockSize=20;
    @track gameBlocks=[];

    renderComplete = false;
    intervel = 200;

    xSpeed = 1;
    ySpeed = 0;

    xHead = 0;
    yHead = 0;

    xMax;
    yMax;

    prevDirection;
    curDirection = 'ArrowRight';
    
    speed = 1;

    intervalObj;

    showOverlay = true;
    gameOver = false;

    @track tail =[];

    startGame (){
        this.showOverlay = false;
        this.intervalObj = setInterval(() => {
            this.move();
        }, 300 / this.speed);
    }

    get displaySpeed(){
        return this.speed.toFixed(1);
    }

    addSpeed() {
        this.speed = this.speed + 0.1;
        clearInterval(this.intervalObj);
        this.startGame();
    }

    move(){
        
        const lastElement = this.tail[this.tail.length - 1];
    
        if (lastElement !== `${this.xHead}:${this.yHead}`) {
            this.tail.push(`${this.xHead}:${this.yHead}`);
            const removedElement = this.tail.shift();
            const curPosIndex = this.gameBlocks.findIndex(x => x.id === removedElement);
            this.gameBlocks[curPosIndex].snake = false;
            this.gameBlocks[curPosIndex].class = '';
        }

        this.xHead += this.xSpeed;
        this.yHead += this.ySpeed;

        if(this.xHead >= this.xMax){
            this.xHead = 0;
        }
        if(this.xHead < 0){
            this.xHead = this.xMax-1;
        }
        if(this.yHead >= this.yMax){
            this.yHead = 0;
        }
        if(this.yHead < 0){
            this.yHead = this.yMax-1;
        }

        if(this.tail.includes(`${this.xHead}:${this.yHead}`)){
            this.exitGame();
        } else {
            const newPosIndex = this.gameBlocks.findIndex(x => x.id === `${this.xHead}:${this.yHead}`);
            this.gameBlocks[newPosIndex].snake = true;
            this.gameBlocks[newPosIndex].class = "snake";
    
            if(this.gameBlocks[newPosIndex].food){
                this.score++;
                this.addSpeed();
                this.tail.push(`${this.xHead}:${this.yHead}`);
                this.gameBlocks[newPosIndex].food = false;                
                this.generateFood();
            }
        }
    }

    generateFood(){
        let xFood = Math.floor(Math.random() * this.xMax);
        let yFood = Math.floor(Math.random() * this.yMax);

        let foodPosIndex = this.gameBlocks.findIndex(x => x.id === `${xFood}:${yFood}`);
        this.gameBlocks[foodPosIndex].food = true;
        this.gameBlocks[foodPosIndex].class = 'food';

    }
    reverseDirection(){
        this.tail.push(`${this.xHead}:${this.yHead}`);
        const removedEl = this.tail.shift();
        this.tail.reverse();
        let ab = removedEl.split(':');
        if (ab) {
            this.xHead = parseInt(ab[0]);
            this.yHead = parseInt(ab[1]);
        }
        
    }

    addKeyBoardControls(){
        window.addEventListener('keydown', (e)=> {
            e.preventDefault();
            switch (e.key) {
                case 'ArrowUp':
                    this.xSpeed = 0;
                    this.ySpeed = -1;
                    if (this.curDirection == 'ArrowDown' && this.tail.length>0) {
                        this.reverseDirection();
                    }
                    this.curDirection = 'ArrowUp';
                    break;
                case 'ArrowDown':
                    this.xSpeed = 0;
                    this.ySpeed = 1;
                    if (this.curDirection == 'ArrowUp' && this.tail.length>0) {
                        this.reverseDirection();
                    }
                    this.curDirection = 'ArrowDown';
                    break;
                case 'ArrowLeft':
                    this.xSpeed = -1;
                    this.ySpeed = 0;
                    if (this.curDirection == 'ArrowRight' && this.tail.length>0) {
                        this.reverseDirection();
                    }
                    this.curDirection = 'ArrowLeft';
                    break;
                case 'ArrowRight':
                    this.xSpeed = 1;
                    this.ySpeed = 0;
                    if (this.curDirection == 'ArrowLeft' && this.tail.length>0) {
                        this.reverseDirection();
                    }
                    this.curDirection = 'ArrowRight';
                    break;
            }
        });
    }

    renderGameBlocks() {
        const gameContainerEl = this.template.querySelector(".game-container");
        const eWidth = gameContainerEl.clientWidth;
        const eHeight = gameContainerEl.clientHeight;

        this.xMax = Math.floor(eWidth / this.blockSize);
        this.yMax = Math.floor(eHeight / this.blockSize);

        const tempBlocks = [];
        for (let y = 0; y < this.yMax; y++) {
            for (let x = 0; x < this.xMax; x++) {
                let obj;
                if (x == 0 && y == 0) {
                    obj = { id: `${x}:${y}`, snake: true, food: false, class: 'snake' };
                } else {
                    obj = { id: `${x}:${y}`, snake: false, food: false, class: '' };
                }

                tempBlocks.push(obj);
            }
        }
        this.gameBlocks = tempBlocks;
    }

    renderedCallback(){
        if(!this.renderComplete){
            this.renderComplete = true;
            this.renderGameBlocks();
            this.addKeyBoardControls();
            this.generateFood();
            window.addEventListener('resize', () => {
                this.resetGameMetrics();
                this.showOverlay = true;
                this.gameOver = false;
            });          
        }
    }

    resetGameMetrics() {
        this.xSpeed = 1;
        this.ySpeed = 0;

        this.xHead = 0;
        this.yHead = 0;

        this.tail = [];

        this.score = 0;
        this.speed = 1;

        this.renderGameBlocks();
        this.generateFood();
        clearInterval(this.intervalObj);
    }

    resetGame() {
        this.resetGameMetrics();
        this.startGame();
    }

    exitGame(){
        this.showOverlay = true;
        this.gameOver = true;
        clearInterval(this.intervalObj);
    }
}
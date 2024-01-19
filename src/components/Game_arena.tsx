import React, { Component} from 'react';
import { FrameCounter } from './Frame_Counter';

export interface GameArenaConfig{
    fpsCounter: FrameCounter;
    resolution: number;
    width: number;
    height: number;
}

export class GameArena extends Component<{},GameArenaConfig>{

    private canvas: React.RefObject<HTMLCanvasElement>;
    private grid: number[][];
    private clickEventListenerAdded: boolean = false;

    constructor(props: {width:number, height: number, resolution: number, fpsCounter: FrameCounter}){
        super(props)

        this.canvas = React.createRef<HTMLCanvasElement>();
        this.grid = [];
        this.state = {
            width: props.width,
            height: props.height,
            resolution: props.resolution,
            fpsCounter: props.fpsCounter,
        }
    }

    public componentDidMount() {
        this.renderStartGrid();
        this.addClickEventListener();
      }
    private createGridArr(): number[][]{
        let gridArr = [];
        let line = [];
        for (let i = 0; i < this.state.resolution; i++) {
          line.push(0);
        }
        for (let ii = 0; ii < this.state.resolution; ii++) {
          let newLine = [...line];
          gridArr.push(newLine);
        }
        return gridArr;
      }
    private renderStartGrid(): void{
        this.grid = this.createGridArr();
        const rectWidth = this.state.width/this.state.resolution;
        let self = this;

        // Get the 'context'
        let ctx = self.canvas.current?.getContext("2d") as CanvasRenderingContext2D;
        ctx.strokeStyle = "#d3d3d3"; // rectangle color
        let x = 0;
        let y = 0;
        for (let ii = 0; ii < self.state.resolution; ii++) {
          for (let i = 0; i < self.state.resolution; i++) {
            ctx.strokeRect(x, y, rectWidth, rectWidth);
            x += rectWidth;
          }
          y += rectWidth;
          x = 0;
        }

      }
    private createNewGrid(): void {  
        const currentGrid = this.grid;
        const newGrid = this.createGridArr();
        const numRows = currentGrid.length;
        const numCols = currentGrid[0].length;
    
        for (let y = 0; y < numRows; y++) {
          for (let x = 0; x < numCols; x++) {
            const neighbors = [
              [y - 1, x - 1],
              [y - 1, x],
              [y - 1, x + 1],
              [y, x - 1],
              [y, x + 1],
              [y + 1, x - 1],
              [y + 1, x],
              [y + 1, x + 1],
            ];
    
            let livingNeighbors = 0;
    
            for (const [ny, nx] of neighbors) {
              if (
                ny >= 0 &&
                ny < numRows &&
                nx >= 0 &&
                nx < numCols &&
                currentGrid[ny][nx]
              ) {
                livingNeighbors++;
              }
            }
    
            if (currentGrid[y][x] && (livingNeighbors < 2 || livingNeighbors > 3)) {
              newGrid[y][x] = 0;
            } else if (!currentGrid[y][x] && livingNeighbors === 3) {
              newGrid[y][x] = 1;
            } else {
              newGrid[y][x] = currentGrid[y][x];
            }
          }
        }
    
        this.grid = newGrid;
      }
    private renderNewFrame(): void {
        const ctx = this.canvas.current?.getContext("2d") as CanvasRenderingContext2D;
        const rectWidth = this.state.width / this.state.resolution;
        const d3Color = "#d3d3d3";
        let y = 0;
    
        ctx.strokeStyle = d3Color;
    
        for (let ii = 0; ii < this.state.resolution; ii++) {
          let x = 0;
    
          for (let i = 0; i < this.state.resolution; i++) {
            ctx.fillStyle = this.grid[ii][i] ? "#000000" : "#ffffff";
            ctx.fillRect(x, y, rectWidth, rectWidth);
            ctx.strokeRect(x, y, rectWidth, rectWidth);
            x += rectWidth;
          }
    
          y += rectWidth;
        }
      }
    private addClickEventListener(): void {
        if (!this.clickEventListenerAdded) {
            let self = this;
            let rectWidth = this.state.width / this.state.resolution;
            let ctx = self.canvas.current?.getContext("2d") as CanvasRenderingContext2D; 
        
            let canvasPos = {
            x: self.canvas.current?.getBoundingClientRect().x || 0,
            y: self.canvas.current?.getBoundingClientRect().y || 0,
            };
        
            window.addEventListener('click', function (event) {
                event.stopPropagation();
                if (
                    event.x >= canvasPos.x &&
                    event.x <= canvasPos.x + self.state.width &&
                    event.y >= canvasPos.y &&
                    event.y <= canvasPos.y + self.state.height
                ) {
                    let rectXpos = Math.floor((event.x - canvasPos.x) / rectWidth);
                    let rectYpos = Math.floor((event.y - canvasPos.y) / rectWidth);
                    if (self.grid[rectYpos][rectXpos] === 0) {
                    ctx.strokeStyle = "#d3d3d3";
                    ctx.fillStyle = "#000000";
                    self.grid[rectYpos][rectXpos] = 1;
                    ctx.fillRect(
                        rectWidth * rectXpos,
                        rectWidth * rectYpos,
                        rectWidth,
                        rectWidth
                    );
                    ctx.strokeRect(
                        rectWidth * rectXpos,
                        rectWidth * rectYpos,
                        rectWidth,
                        rectWidth
                    );
                    } else {
                        self.grid[rectYpos][rectXpos] = 0;
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(
                        rectWidth * rectXpos,
                        rectWidth * rectYpos,
                        rectWidth,
                        rectWidth
                    );
                    ctx.strokeRect(
                        rectWidth * rectXpos,
                        rectWidth * rectYpos,
                        rectWidth,
                        rectWidth
                    );
                    }
                }
            });

            this.clickEventListenerAdded = true;
        }
      }
    public play() {
        this.state.fpsCounter.init();
        const updateAndRender = () => {
          this.createNewGrid();
          this.renderNewFrame();
          this.state.fpsCounter.tick();
          requestAnimationFrame(updateAndRender);
        };
        updateAndRender();
      }
    render(){
        return <canvas ref={this.canvas} width={this.state.width} height={this.state.height} />
    }
    
}
import React, { Component } from 'react';
import { FrameCounter } from './Frame_Counter';

export interface GameArenaConfig {
  fpsCounter: FrameCounter;
  resolution: number;
  width: number;
  height: number;
  aliveTileColor: string;
  deadTileColor: string;
  gridColor: string
}

export class GameArena extends Component<{}, GameArenaConfig> {

  private canvas: React.RefObject<HTMLCanvasElement>;
  private offscreenCanvas: OffscreenCanvas | null;
  private offscreenCtx: OffscreenCanvasRenderingContext2D | null;
  private grid: number[][];
  private clickEventListenerAdded: boolean = false;
  private rectWidth: number;
  private isPlaying = false;

  constructor(props: { width: number; height: number; resolution: number; fpsCounter: FrameCounter; aliveTileColor: string; deadTileColor: string; gridColor: string }) {
    super(props);

    this.canvas = React.createRef<HTMLCanvasElement>();
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.grid = [];
    this.rectWidth = props.width / props.resolution;
    this.state = {
      width: props.width,
      height: props.height,
      resolution: props.resolution,
      fpsCounter: props.fpsCounter,
      aliveTileColor: props.aliveTileColor,
      deadTileColor: props.deadTileColor,
      gridColor: props.gridColor
    };
  }

  public componentDidMount() {
    this.setupOffscreenCanvas();
    this.renderStartGrid();
    this.addClickEventListener();
  }
  private setupOffscreenCanvas() {
    if ('OffscreenCanvas' in window) {
      this.offscreenCanvas = new OffscreenCanvas(this.state.width, this.state.height);
      this.offscreenCtx = this.offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    }
  }
  private createGridArr(): number[][] {
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
  private renderStartGrid(): void {
    this.grid = this.createGridArr();
    const rectWidth = this.rectWidth;
    const ctx = this.canvas.current?.getContext('2d') as CanvasRenderingContext2D;

    ctx.strokeStyle = this.state.gridColor;
    ctx.fillStyle = this.state.deadTileColor;
    let x = 0;
    let y = 0;

    for (let ii = 0; ii < this.state.resolution; ii++) {
      for (let i = 0; i < this.state.resolution; i++) {
        ctx.strokeRect(x, y, rectWidth, rectWidth);
        ctx.fillRect(x, y, rectWidth, rectWidth);
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
    const rectWidth = this.rectWidth;
    const fillRectPositions: { x: number; y: number; width: number; height: number; color: string }[] = [];
    let y = 0;

    for (let ii = 0; ii < this.state.resolution; ii++) {
      let x = 0;

      for (let i = 0; i < this.state.resolution; i++) {
        const color = this.grid[ii][i] ? this.state.aliveTileColor : this.state.deadTileColor;
        fillRectPositions.push({
          x,
          y,
          width: rectWidth,
          height: rectWidth,
          color,
        });
        x += rectWidth;
      }

      y += rectWidth;
    }

    if (this.offscreenCtx) {
      this.offscreenCtx!.strokeStyle = this.state.gridColor;
      for (let i = 0; i < fillRectPositions.length; i++) {
        const { x, y, width, height, color } = fillRectPositions[i];
        this.offscreenCtx!.fillStyle = color;


        this.offscreenCtx?.strokeRect(x, y, width, height);
        this.offscreenCtx?.fillRect(x, y, width, height);
      }

      this.canvas.current!.getContext('2d')?.drawImage(this.offscreenCanvas!, 0, 0);
    }
  }
  private addClickEventListener(): void {
    if (!this.clickEventListenerAdded) {
      let self = this;
      let rectWidth = this.rectWidth;
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
            ctx.strokeStyle = self.state.gridColor;
            ctx.fillStyle = self.state.aliveTileColor;
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
            ctx.fillStyle = self.state.deadTileColor;
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
    this.isPlaying = true;
    const updateAndRender = () => {
      this.createNewGrid();
      this.renderNewFrame();
      this.state.fpsCounter.tick();
      if (this.isPlaying) {
        requestAnimationFrame(updateAndRender);
      }
    };

    updateAndRender();

  }
  public stop() {
    if (this.isPlaying) {
      this.state.fpsCounter.reset();
      this.isPlaying = false;
    }
  }
  public restartGame() {
    this.stop();
    this.renderStartGrid();
    this.renderNewFrame();
  }
  render() {
    return <canvas ref={this.canvas} width={this.state.width} height={this.state.height} />
  }

}
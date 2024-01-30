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
    this.rectWidth = (props.width / props.resolution) - 1;
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
    this.renderNewFrame();
    if (!this.clickEventListenerAdded) {
      this.addClickListener();
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
  private combineRows(frame: number[][]) {
    let combined: number[] = [];
    for (let i = 0; i < frame.length; i++) {
      combined = [...combined, ...frame[i]];
    }
    return combined;
  }
  private renderNewFrame(): void {
    const rectWidth = this.rectWidth;
    const fillRectPositions: { x: number; y: number; width: number; height: number; color: string }[] = [];
    const startX = 0;
    const incrementY = rectWidth + 1;
    const tilesPerRow = this.state.resolution;
    const currentFrame = this.combineRows(this.grid);
    for (let i = 0; i < currentFrame.length; i++) {
      const color = currentFrame[i] ? this.state.aliveTileColor : this.state.deadTileColor;
      const column = i % tilesPerRow; // Calculate the column position within the row
      const row = Math.floor(i / tilesPerRow); // Calculate the row position
      const x = startX + column * incrementY; // Adjusted calculation to start at x:10
      const y = row * incrementY;
      fillRectPositions.push({
        x,
        y,
        width: rectWidth,
        height: rectWidth,
        color,
      });
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
  private addClickListener(): void {
    const canvas = this.canvas.current; // Assuming this.canvas is your canvas element
    const rectWidth = this.rectWidth;
    const tilesPerRow = this.state.resolution;



    const clickHandler = (event: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Calculate the clicked tile position
      const column = Math.floor(mouseX / (rectWidth + 1));
      const row = Math.floor(mouseY / (rectWidth + 1));
      const index = row * tilesPerRow + column;


      this.grid[row][column] = this.grid[row][column] ? 0 : 1;
      this.renderNewFrame();
      event.preventDefault();
      event.stopPropagation();
    };
    canvas?.addEventListener('click', clickHandler);
    this.clickEventListenerAdded = true;
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
  }
  render() {
    return <canvas ref={this.canvas} width={this.state.width} height={this.state.height} />
  }

}
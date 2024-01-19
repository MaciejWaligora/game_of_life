import React, { Component } from 'react';

interface FrameCounterState {
    frames: number;
    lastTimeStamp: number;
    currentFps: number;
  }
  
export class FrameCounter extends Component<{}, FrameCounterState> {
    constructor(props: {}) {
      super(props);
  
      this.state = {
        frames: 0,
        lastTimeStamp: 0,
        currentFps: 0,
      };
      
    }

    private _updateFPS = () => {
        const currentTimeStamp = performance.now();
        const elapsedTime = currentTimeStamp - this.state.lastTimeStamp;
    
        if (elapsedTime >= 1000) {
          const fps = (this.state.frames / elapsedTime) * 1000;
    
          this.setState({
            frames: 0,
            lastTimeStamp: currentTimeStamp,
            currentFps: fps,
          });
        }
    
        requestAnimationFrame(this._updateFPS);
      };
  
    public componentDidMount() {
      this._updateFPS();
    }
  
    public render() {
      return <div>{this.state.currentFps.toFixed(2)}fps</div>;
    }
  
    public tick() {
      this.setState((prevState) => ({
        ...prevState,
        frames: prevState.frames + 1,
      }));
    }
  
    public init() {
      this.setState({
        lastTimeStamp: performance.now(),
      });
    }
  }
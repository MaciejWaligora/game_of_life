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
    let backgroundColor = '';
    if (this.state.currentFps < 21) {
      backgroundColor = 'rgba(255, 0, 0, 0.3)'; // Red with 50% transparency
    } else if (this.state.currentFps < 24) {
      backgroundColor = 'rgba(255, 255, 0, 0.3)'; // Yellow with 50% transparency
    } else {
      backgroundColor = 'rgba(55, 255, 0, 0.3)'; // Green with 50% transparency
    }

    const divStyle = {
      backgroundColor,
      padding: '10px', // You can customize other styles as needed
    };

    return (
      <div style={divStyle}>
        {this.state.currentFps.toFixed(2)} fps
      </div>
    );
  }
  public tick() {
    this.setState((prevState) => ({
      ...prevState,
      frames: prevState.frames + 1,
    }));
  }
  public reset() {
    this.setState({
      frames: 0,
      lastTimeStamp: 0,
      currentFps: 0,
    })
  }
  public init() {
    this.setState({
      lastTimeStamp: performance.now(),
    });
  }
}
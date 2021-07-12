import autoBind from 'react-autobind';
import React from 'react';

import {bem} from 'js/bem';

import 'js/components/common/audioPlayer.scss';

bem.AudioPlayer = bem.create('audio-player');
bem.AudioPlayer__controls = bem.AudioPlayer.__('controls', '<div>');
bem.AudioPlayer__progress = bem.AudioPlayer.__('progress', '<div>');
bem.AudioPlayer__time = bem.AudioPlayer.__('time', '<div>');
bem.AudioPlayer__timeCurrent = bem.AudioPlayer.__('time-current', '<span>');
bem.AudioPlayer__timeTotal = bem.AudioPlayer.__('time-total', '<span>');
bem.AudioPlayer__seek = bem.AudioPlayer.__('seek', '<div>');

/*
 * Custom audio player for viewing audio submissions in data table
 *
 * @param {string} mediaURL
 */
class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isPlaying: false,
      currentTime: 0,
      totalTime: 0,
      audioInterface: new Audio(props.mediaURL),
    };

    // Set up listeners for audio component
    this.state.audioInterface.onloadedmetadata = () => {
      this.setState({
        totalTime: this.state.audioInterface.duration,
      });
    };

    this.state.audioInterface.ontimeupdate = () => {
      // Pause the player when it reaches the end
      if (
        this.state.audioInterface.currentTime === this.state.totalTime &&
        this.state.isPlaying
      ) {
        this.onPlayStatusChange();
      }

      this.setState({
        currentTime: this.state.audioInterface.currentTime,
      });
    };

    autoBind(this);
  }

  onPlayStatusChange() {
    if (!this.state.isPlaying) {
      this.state.audioInterface.play();
    } else {
      this.state.audioInterface.pause();
    }

    this.setState({
      isPlaying: !this.state.isPlaying,
    });
  }

  onSeekChange(newVal) {
    const newTime = newVal.currentTarget.value;

    this.state.audioInterface.currentTime = newTime;

    this.setState({
      currentTime: parseInt(newTime),
    });
  }

  /* We deal internally with un-converted time for easier computing. Only use
   * this when it's time to display
   *
   * @param {float} time - HTMLElementAudio.duration returns a float in seconds
   */

  convertToClock(time) {
    let minutes = Math.floor(time / 60);
    // The duration is given in decimal seconds, so we have to ceiling here
    let seconds = Math.ceil(time - minutes * 60);

    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
  }

  render() {
    return (
      <bem.AudioPlayer>
        <bem.AudioPlayer__controls>
          {this.state.isPlaying && (
            <i
              className='k-icon k-icon-qt-area'
              onClick={this.onPlayStatusChange}
            />
          )}

          {!this.state.isPlaying && (
            <i
              className='k-icon k-icon-caret-right'
              onClick={this.onPlayStatusChange}
            />
          )}
        </bem.AudioPlayer__controls>

        <bem.AudioPlayer__progress>
          <bem.AudioPlayer__time>
            <bem.AudioPlayer__timeCurrent>
              {this.convertToClock(this.state.currentTime)}
            </bem.AudioPlayer__timeCurrent>

            <bem.AudioPlayer__timeTotal>
              {this.convertToClock(this.state.totalTime)}
            </bem.AudioPlayer__timeTotal>
          </bem.AudioPlayer__time>

          <bem.AudioPlayer__seek>
            <input
              type='range'
              max={this.state.totalTime}
              value={this.state.currentTime}
              onChange={this.onSeekChange}
            />
          </bem.AudioPlayer__seek>
        </bem.AudioPlayer__progress>
      </bem.AudioPlayer>
    );
  }
}

export default AudioPlayer;

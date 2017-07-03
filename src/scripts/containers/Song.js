import React, {Component} from 'react';
import {connect} from 'react-redux';

import Song from '../components/Song';

import {addClonedSongs, addClonedSongToTopAndPlay, remove as removeFromQueue} from '../actions/QueueActions';
import {setCurrentSong, pause, play} from '../actions/PlayerActions';


const mapStateToProps = (state, ownProps) => ({
  song: state.songs[ownProps.id],
  isCurrentSong: false,
  isPlaying: false,
  inQueue: false
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  addToQueue: song => () =>  dispatch(addClonedSongs([song])),
  play: song => () => dispatch(addClonedSongToTopAndPlay(song)),
  setCurrentSong: song => () => dispatch(addClonedSongToTopAndPlay(song)),

  pause: () => dispatch(pause())
});


export default connect(mapStateToProps, mapDispatchToProps)(Song);

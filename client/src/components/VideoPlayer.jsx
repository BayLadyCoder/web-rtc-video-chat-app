import React, {
  useContext,
  useRef,
  useEffect,
  createRef,
  useState,
} from 'react';
import { Grid, Typography, Paper, IconButton } from '@material-ui/core';
import { Mic, MicOff, Videocam, VideocamOff } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import { SocketContext } from '../SocketContext';

const useStyles = makeStyles((theme) => ({
  video: {
    width: '550px',
    [theme.breakpoints.down('xs')]: {
      width: '300px',
    },
  },
  gridContainer: {
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  paper: {
    padding: '10px',
    border: 'solid 2px black',
    margin: '10px',
  },
}));

const VideoPlayer = () => {
  const classes = useStyles();
  const {
    name,
    callAccepted,
    myVideo,
    callEnded,
    stream,
    calls,
    userVideoRefs,
    turnOffCamera,
    turnOnCamera,
  } = useContext(SocketContext);

  return (
    <Grid container className={classes.gridContainer}>
      {/* My video */}
      {stream && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant='h5' gutterBottom>
              {name || 'My Name'}
            </Typography>
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className={classes.video}
            />
          </Grid>
          {/* TODO: make them togglable */}
          <IconButton>
            <Mic />
          </IconButton>
          <IconButton>
            <MicOff />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              turnOnCamera();
            }}
          >
            <Videocam />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              turnOffCamera();
            }}
          >
            <VideocamOff />
          </IconButton>
        </Paper>
      )}

      {/* Users video */}
      {callAccepted &&
        !callEnded &&
        calls.map((call, i) => (
          <Paper className={classes.paper} key={i}>
            <Grid item xs={12} md={6}>
              <Typography variant='h5' gutterBottom>
                {call.name || "User's Name"}
              </Typography>
              <video
                playsInline
                ref={userVideoRefs.current[i]}
                autoPlay
                className={classes.video}
              />
            </Grid>
          </Paper>
        ))}
    </Grid>
  );
};

export default VideoPlayer;

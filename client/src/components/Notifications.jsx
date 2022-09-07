import React, { useContext } from 'react';
import { Button } from '@material-ui/core';

import { SocketContext } from '../SocketContext';

const Notifications = () => {
  const { calls, answerCall, callAccepted, name } = useContext(SocketContext);
  if (calls.length === 0) {
    return null;
  }

  // TODO: Update callAccepted to support multiple users
  return (
    <>
      {calls[calls.length - 1].isReceivedCall && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <h1>{calls[calls.length - 1].name} is calling: </h1>
          <Button
            variant='contained'
            color='primary'
            onClick={() => answerCall(name)}
          >
            Answer
          </Button>
        </div>
      )}
    </>
  );
};

export default Notifications;

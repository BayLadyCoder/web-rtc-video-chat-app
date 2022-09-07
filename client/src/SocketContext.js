import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  createRef,
} from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();
const socket = io('http://localhost:5000');

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState('');
  const [calls, setCalls] = useState([]);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [name, setName] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);

  const myVideo = useRef();
  const userVideoRefs = useRef([
    createRef(),
    createRef(),
    createRef(),
    createRef(),
    createRef(),
  ]);

  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });

    socket.on('me', (id) => setMe(id));

    socket.on('calluser', ({ from, name: callerName, signal }) => {
      // should keep track on all calls/users on server instead of client
      // so all the users can sync with current users in the room
      setCalls((prevCalls) => {
        const newCall = [...prevCalls];
        newCall.push({
          isReceivedCall: true,
          from,
          name: callerName,
          signal,
        });
        return newCall;
      });
    });
  }, []);

  const answerCall = (callReceiverName) => {
    setTotalUsers(totalUsers + 1);

    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answercall', {
        signal: data,
        to: calls[calls.length - 1].from,
        callReceiverName,
      });
    });

    peer.on('stream', (currentStream) => {
      userVideoRefs.current[totalUsers].current.srcObject = currentStream;
    });

    peer.signal(calls[calls.length - 1].signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    setIsCalling(true);
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('calluser', {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on('stream', (currentStream) => {
      userVideoRefs.current[totalUsers].current.srcObject = currentStream;
    });

    socket.on('callaccepted', ({ signal, callReceiverName }) => {
      setTotalUsers(totalUsers + 1);
      setIsCalling(false);
      setCallAccepted(true);
      peer.signal(signal);
      setCalls((prevCalls) => {
        const newCall = [...prevCalls];
        newCall[totalUsers] = {
          ...newCall[totalUsers],
          name: callReceiverName,
        };

        return newCall;
      });
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const turnOffCamera = () => {
    // bug to fix: when turn off camera
    // it's black on my screen
    // but it's capture my last moment on other screens
    // it should turn black and show my name as default
    const videoTrack = myVideo.current.srcObject
      .getTracks()
      .find((track) => track.kind === 'video');
    videoTrack.stop();
  };

  const turnOnCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });
  };
  const turnOffMicrophone = () => {};
  const turnOnMicrophone = () => {};

  return (
    <SocketContext.Provider
      value={{
        calls,
        callAccepted,
        myVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        isCalling,
        userVideoRefs,
        turnOnCamera,
        turnOffCamera,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };

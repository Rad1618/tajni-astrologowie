import { useState, useEffect, useRef } from 'react';
import sha256 from 'crypto-js/sha256';
import EntrancePage from './pages/Entrance';
import Members from './components/Members';
import SideBar from './components/SideBar';
import Lobby from './pages/Lobby';
import GamePage from './pages/GamePage';
import VotingModal from './modals/VotingModal';
import './App.css';

let drone = null;

function App() {
  const [roomN, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [win, setWin] = useState("None");
  const BOTS = 6;

  const [me, setMe] = useState(
    {
      color: "red",
      username: "noname",
      admin: false,
    }
  );

  const [members, setMembers] = useState([]);
  const [gameState, setGameState] = useState(null);

  const messagesRef = useRef();
  messagesRef.current = messages;
  const membersRef = useRef();
  membersRef.current = members;
  const meRef = useRef();
  meRef.current = me;
  const gameRef = useRef();
  gameRef.current = gameState;

  function connectToScaledrone() {
    meRef.current.color = "green";
    // meRef.current.username = getName();
    
    drone = new window.Scaledrone('f425Sm8KQuR5wmCc', {
      data: meRef.current,
    });
    drone.on('open', error => {
      if (error) {
        return console.error(error);
      }
      meRef.current.id = drone.clientId;
      setMe(meRef.current);
    });
    const room = drone.subscribe('observable-room-' + roomN);

    room.on('message', message => {
      if (!message?.data)
        return;
      const data = message.data;
      if (!data?.type || !data?.data)
        return;
      if (data.type === "message")
      {
        const m = {...message, data: data.data}
        setMessages([...messagesRef.current, m]);
      }
      else if (data.type === "game")
      {
        if ((data.data?.version ?? -1) <= (gameRef.current?.version ?? -2))
          return;
        console.log(data.data);
        setGameState(data.data ?? {});
        setWin(checkWinCondition(data.data));
      }
      else if (data.type === "members")
      {
        setMembers(data.data);
      }
    });
    room.on('members', members => {
      setMembers(members);
    });
    room.on('member_join', member => {
      setMembers([...membersRef.current, member]);
      if (gameRef.current != null)
      {
        const message = {type: "game", data: gameRef.current};
        drone.publish({
          room: "observable-room-" + roomN,
          message
        });
      }
    });
    room.on('member_leave', ({id}) => {
      const index = membersRef.current.findIndex(m => m.id === id);
      const newMembers = [...membersRef.current];
      newMembers.splice(index, 1);
      setMembers(newMembers);
    });
  }

  useEffect(() => {
    if (roomN == null)
      return;
    if (drone === null) {
      connectToScaledrone();
    }
  }, [roomN]);

  function setNames(roomName, userName)
  {
    if (roomName === "" || userName === "")
      return;
    setRoom(roomName);
    setMe({...me, username: userName});
  }

  function onGameStateChange(gameState)
  {
    gameState.version += 1;
    if (drone === null)
      return;
    const message = {type: "game", data: gameState};
    drone.publish({
      room: "observable-room-" + roomN,
      message
    });
  }

  function switchAdmin()
  {
    if (!me?.admin)
    {
      const password = prompt("Admin password:");
      const hash = sha256(password).toString();
      // if (hash != '523435ae129b2967a8488fcd056d4f82e5b7006d7e6b8a9c5f77e1060a7b5508')
      //   return;
    }
    setMe({...me, admin: !me?.admin});
    const newMembers = members.map(m => m.id === me.id ? {...m, admin: !(m?.admin)} : m);
    const message = {type: "members", data: newMembers};
    drone.publish({
      room: "observable-room-" + roomN,
      message
    });
  }

  function checkWinCondition(gameState)
  {
    let remainingAstrologs = 0;
    let remainingAstronoms = 0;
    let removedAstronoms = 0;
    gameState.seats.forEach((s) => {
      if (s.side === "astrolog" && !(s?.removed || false))
        remainingAstrologs++;
      else if (s.side === "astronom")
      {
        if (!(s?.removed || false))
          remainingAstronoms++;
        else
          removedAstronoms++;
      }
    });
    if (remainingAstrologs === 0)
      return "Astronoms";
    if (removedAstronoms >= 2)
      return "Astrologs";
    if (remainingAstrologs >= remainingAstronoms)
      return "Astrologs";
    return "None";
  }

  return (
    <div className="App">
      <header>
        <title>Tajni Astrologowie</title>
        <meta name='description' content='Gra w Niewidzialnych Astrologów' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </header>
      <main className="appMain">
        <div className="appContent">
          {roomN ? <>
          <Members members={members} me={me} room={roomN}/>
          <div className="appGrid">
            <SideBar me={me} switchAdmin={switchAdmin}/>
            {
              gameState ?
              <GamePage gameState={gameState} setGameState={onGameStateChange} me={me} win={win} checkWin={checkWinCondition}/>
              :
              <Lobby gameState={gameState} setGameState={onGameStateChange} members={members} bots={BOTS} />
            }
          </div></> : 
          <EntrancePage setRoom={setNames}/>
          }
        </div>
        <VotingModal gameState={gameState} setGameState={onGameStateChange} me={me} bots={BOTS}/>
      </main>
    </div>
  );
}

export default App;

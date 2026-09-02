import { useState } from 'react';
import '../App.css';

export default function EntrancePage({setRoom})
{
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");

  return (
    <div className="entrancePage">
      <div>Name</div>
      <textarea className="entranceTextArea" onChange={(e) => setUserName(e.target.value)}></textarea>
      <div>Room</div>
      <textarea className="entranceTextArea" onChange={(e) => setRoomName(e.target.value)}></textarea>
      <button className="entranceButton" onClick={() => setRoom(roomName, userName)}>Enter</button>
    </div>
  );
}
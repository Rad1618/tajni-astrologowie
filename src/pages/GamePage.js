import { useState, useEffect } from "react";
import { useInterval } from "usehooks-ts"
import GameBoard from "../components/GameBoard";
import '../styles/game.css';

export default function GamePage({gameState, setGameState, me, win, checkWin, options})
{
  const [seat, setSeat] = useState(-1);
  const [role, setRole] = useState(me?.dev ? "Dev" : "User");
  const [astroLOG, setAstroLOG] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  useInterval(updateRemainingTime, 1000);
  const d = new Date();

  function updateRemainingTime()
  {
    if (!options.timeOn)
      return;
    let newTime = (gameState?.endTime ?? d.getTime()) - d.getTime();
    if (!!gameState?.voting?.active)
      newTime += d.getTime() - gameState.voting.startTime;
    setRemainingTime(Math.max(0, newTime));
    if (newTime < 0 && !gameState.ended)
      setGameState({...gameState, ended: true});
  }
  
  useEffect(() => {
    if (!gameState?.seats)
      return;
    for (let i = 0; i < gameState.seats.length; i++)
    {
      if (gameState.seats[i].id === me.id)
      {
        setSeat(i);
        setRole(gameState.seats[i].role);
      }
    }
  }, [gameState])

  function filterEvents(event, mySeat)
  {
    if (me?.dev || event.visibility === "all")
      return true;
    if (!mySeat)
      return false;
    if (event.visibility === "astrolodzy" && mySeat?.side === "astrolog" && !mySeat.manipulated)
      return true;
    if (event.visibility === mySeat.id)
      return true;
    return false;
  }

  function sendMessage(e)
  {
    e.preventDefault();
    if (!gameState)
      return;
    if (astroLOG.length === 0 || astroLOG.length > 20 || (gameState.seats[seat]?.astroLOGMessages ?? 0) >= options.astroLOG)
      return;
    const newState = {...gameState};
    newState.astroLOG = [...newState?.astroLOG ?? [], {name: newState.seats[seat].username, text: astroLOG}];
    newState.seats[seat].astroLOGMessages = (newState.seats[seat]?.astroLOGMessages ?? 0) + 1;
    setGameState(newState);
  }

  if (!gameState)
    return null;

  return (
    <div>
      {win === "Astrologs" && <div className="gameWin">Wygrali Astrolodzy</div>}
      {win === "Astronoms" && <div className="gameWin">Wygrali Astronomowie</div>}
      <div className="gamePlayerData">
        <div>Twoja rola: {role}</div>
        <div>Twoja strona: <span className={(seat !== -1 ? (gameState.seats[seat]?.side === "astrolog" ? "gameSideAstrolog" : undefined) : undefined)}>{gameState.seats[seat]?.side ?? "-"}</span></div>
        {options.timeOn && <div>Pozostały czas: {Math.floor(remainingTime/60000)}:{Math.floor(remainingTime/1000)%60 < 10 ? "0" : ""}{Math.floor(remainingTime/1000)%60}</div>}
      </div>
      <GameBoard gameState={gameState} setGameState={setGameState} seat={seat} me={me} checkWin={checkWin} options={options}/>
      <div className="gameBoardsContainer">
        <div className="gameBoard">
          <div className="gameBoardName">Tablica ogłoszeń</div>
          <div className="gameBoardContent">
            {gameState.events && gameState.events.filter(e => filterEvents(e, gameState.seats[seat])).map((event, idx) => 
            <div className="gameBoardMessage" key={idx}>
              {event.text}
            </div>)}
          </div>
        </div>
        <div className="gameBoard">
          {(me?.dev || (gameState.seats[seat]?.side === "astrolog" && !gameState.seats[seat]?.manipulated)) && <>
          <div className="gameBoardName">AstroLOG Codzienny</div>
          <div className="gameBoardContent">
            {gameState.astroLOG && gameState.astroLOG.map((m, idx) => 
            <div className="gameBoardMessage" key={idx}>
              {m.name}: {m.text}
            </div>)}
          </div>
          <div className="gameBoardTextAreaContainer">
            <textarea className="gameBoardTextArea" onChange={(e) => setAstroLOG(e.target.value)}></textarea>
            <div className="gameBoardTextAreaInfo">{gameState.seats[seat]?.astroLOGMessages ?? 0}/{options.astroLOG} {astroLOG.length}/20</div>
            <button className="gameButton" onClick={sendMessage}>Wyślij</button>
          </div>
          </>}
        </div>
      </div>
    </div>
  );
}
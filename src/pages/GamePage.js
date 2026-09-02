import { useState, useEffect } from "react";
import GameBoard from "../components/GameBoard";
import '../styles/game.css';

export default function GamePage({gameState, setGameState, me, win, checkWin})
{
  const [seat, setSeat] = useState(-1);
  const [role, setRole] = useState(me?.admin ? "Admin" : "User");
  const [astroLOG, setAstroLOG] = useState("");
  
  useEffect(() => {
    if (!gameState?.seats)
      return;
    for (let i = 0; i < gameState.seats.length; i++)
    {
      if (gameState.seats[i].id === me.id)
      {
        setSeat(i);
        setRole(gameState.seats[i].role);
        if (!gameState.seats[i].botAdmin)
          return;
      }
    }
    if (gameState.orders.length === 0)
      return;
    for (let i = 0; i < gameState.seats.length; i++)
    {
      // checking if bot player has now action
      if (gameState.seats[i].bot && gameState.orders[0] === gameState.seats[i].order)
      {
        botAction();
        return;
      }
    }
  }, [gameState])

  function botAction()
  {
    let orders = [...gameState?.orders] ?? [];
    orders.splice(0, 1);
    setGameState({...gameState, orders: orders});
  }

  function filterEvents(event, mySeat)
  {
    if (me?.admin || event.visibility === "all")
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
    if (astroLOG.length === 0 || astroLOG.length > 20 || (gameState.seats[seat]?.astroLOGMessages ?? 0) >= 3)
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
      </div>
      <GameBoard gameState={gameState} setGameState={setGameState} seat={seat} me={me} checkWin={checkWin}/>
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
          {(me?.admin || (gameState.seats[seat]?.side === "astrolog" && !gameState.seats[seat]?.manipulated)) && <>
          <div className="gameBoardName">AstroLOG Codzienny</div>
          <div className="gameBoardContent">
            {gameState.astroLOG && gameState.astroLOG.map((m, idx) => 
            <div className="gameBoardMessage" key={idx}>
              {m.name}: {m.text}
            </div>)}
          </div>
          <div className="gameBoardTextAreaContainer">
            <textarea className="gameBoardTextArea" onChange={(e) => setAstroLOG(e.target.value)}></textarea>
            <div className="gameBoardTextAreaInfo">{gameState.seats[seat]?.astroLOGMessages ?? 0}/3 {astroLOG.length}/20</div>
            <button className="gameButton" onClick={sendMessage}>Wyślij</button>
          </div>
          </>}
        </div>
      </div>
    </div>
  );
}
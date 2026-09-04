import '../styles/sidebar.css';

export default function SideBar({me, switchDev, options, setOptions, gameStarted, setGameState})
{
  return (<div className="sidebarContainer">
    <div className="sidebarBoolContainer">
      <button disabled={gameStarted} className={(me?.dev ?? false) ? "sidebarBoolActive" : "sidebarBool"} onClick={switchDev}></button>
      <div>Dev</div>
    </div>
    <div>Bots: {options.bots}</div>
    <div className="sidebarStandardContainer">
      <button disabled={gameStarted} className='sidebarStandardButton' onClick={() => setOptions({...options, bots: Math.max(0, options.bots - 1)})}>-</button>
      <button disabled={gameStarted} className='sidebarStandardButton' onClick={() => setOptions({...options, bots: options.bots + 1})}>+</button>
    </div>
    <div className="sidebarBoolContainer">
      <button disabled={gameStarted} className={(options.timeOn) ? "sidebarBoolActive" : "sidebarBool"} onClick={() => setOptions({...options, timeOn: !options.timeOn})}></button>
      <div>Timer</div>
    </div>
    <div>Time: {options.timeOn ? options.time : "-"} min</div>
    <div className="sidebarStandardContainer">
      <button disabled={gameStarted} className='sidebarStandardButton' onClick={() => setOptions({...options, time: Math.max(0, options.time - 1)})}>-</button>
      <button disabled={gameStarted} className='sidebarStandardButton' onClick={() => setOptions({...options, time: options.time + 1})}>+</button>
    </div>
    <div>Bonus: {options.timeOn ? options.bonusTime : "-"} min</div>
    <div className="sidebarStandardContainer">
      <button disabled={gameStarted} className='sidebarStandardButton' onClick={() => setOptions({...options, bonusTime: Math.max(0, options.bonusTime - 1)})}>-</button>
      <button disabled={gameStarted} className='sidebarStandardButton' onClick={() => setOptions({...options, bonusTime: options.bonusTime + 1})}>+</button>
    </div>
    <div className="sidebarBoolContainer">
      <button disabled={gameStarted} className={(options.gorszyObozny) ? "sidebarBoolActive" : "sidebarBool"} onClick={() => setOptions({...options, gorszyObozny: !options.gorszyObozny})}></button>
      <div>Gorszy Oboźny</div>
    </div>
    <div>AstroLOG: {options.astroLOG}</div>
    <div className="sidebarStandardContainer">
      <button disabled={gameStarted} className='sidebarStandardButton' onClick={() => setOptions({...options, astroLOG: Math.max(0, options.astroLOG - 1)})}>-</button>
      <button disabled={gameStarted} className='sidebarStandardButton' onClick={() => setOptions({...options, astroLOG: options.astroLOG + 1})}>+</button>
    </div>
    <div className="sidebarTriggerContainer">
      <button disabled={!gameStarted} className="sidebarTrigger" onClick={() => setGameState("Reset")}></button>
      <div>Reset</div>
    </div>
  </div>);
}
import '../styles/sidebar.css';

export default function SideBar({me, switchDev, options, setOptions})
{
  return (<div className="sidebarContainer">
    <div className="sidebarBoolContainer">
      <div className={(me?.dev ?? false) ? "sidebarBoolActive" : "sidebarBool"} onClick={switchDev}></div>
      <div>Dev</div>
    </div>
    <div>Bots: {options.bots}</div>
    <div className="sidebarStandardContainer">
      <button className='sidebarStandardButton' onClick={() => setOptions({...options, bots: Math.max(0, options.bots - 1)})}>-</button>
      <button className='sidebarStandardButton' onClick={() => setOptions({...options, bots: options.bots + 1})}>+</button>
    </div>
    <div>Time: {options.time} min</div>
    <div className="sidebarStandardContainer">
      <button className='sidebarStandardButton' onClick={() => setOptions({...options, time: Math.max(0, options.time - 1)})}>-</button>
      <button className='sidebarStandardButton' onClick={() => setOptions({...options, time: options.time + 1})}>+</button>
    </div>
    <div>Bonus: {options.bonusTime} min</div>
    <div className="sidebarStandardContainer">
      <button className='sidebarStandardButton' onClick={() => setOptions({...options, bonusTime: Math.max(0, options.bonusTime - 1)})}>-</button>
      <button className='sidebarStandardButton' onClick={() => setOptions({...options, bonusTime: options.bonusTime + 1})}>+</button>
    </div>
    <div className="sidebarBoolContainer">
      <div className={(options.gorszyObozny) ? "sidebarBoolActive" : "sidebarBool"} onClick={() => setOptions({...options, gorszyObozny: !options.gorszyObozny})}></div>
      <div>Gorszy Obozny</div>
    </div>
    <div>AstroLOG: {options.astroLOG}</div>
    <div className="sidebarStandardContainer">
      <button className='sidebarStandardButton' onClick={() => setOptions({...options, astroLOG: Math.max(0, options.astroLOG - 1)})}>-</button>
      <button className='sidebarStandardButton' onClick={() => setOptions({...options, astroLOG: options.astroLOG + 1})}>+</button>
    </div>
  </div>);
}
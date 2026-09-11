import { useState } from "react";
import OftenUsedSetups from "../modals/OftenUsedSetups";
import { ROLES } from "../data/roles";
import { Sun, Moon } from "lucide-react";
import styles from "../styles/lobby.css"

const noBotRoles = ["Komendant", "Manipulator", "Bydło"];

export default function Lobby({gameState, setGameState, members, options, setOptions})
{
  const [bydloCount, setBydloCount] = useState(0);
  const devs = members ? members.filter(m => m?.dev).length : 0;

  const [setupsModalOpen, setSetupsModalOpen] = useState(false);

  function setSelectedRoles(roles)
  {
    setOptions({...options, selectedRoles: roles});
  }

  function createGame()
  {
    if (!members)
      return;
    if (options.selectedRoles.length + bydloCount < members.length + options.bots - devs)
      return;
    let overflow = options.selectedRoles.length + bydloCount - members.length - options.bots + devs;
    let astrologs = 0;
    for (let i = 0; i < options.selectedRoles.length; i++)
    {
      if (options.selectedRoles[i].side === "astrolog")
        astrologs++;
    }
    // There cannot be more astrologs than available seats
    if (astrologs > members.length + options.bots)
      return;
    let remainingRoles = [...options.selectedRoles];
    let removedRoles = [];
    while (overflow > 0)
    {
      const id = Math.floor(Math.random() * remainingRoles.length);
      const randRole = remainingRoles[id];
      if (randRole.side === 'astrolog')
        continue;
      overflow--;
      removedRoles.push(randRole);
      remainingRoles.splice(id, 1);
    }

    const newGame = {
      version: 0,
      seats: [],
      voting: {active: false, finalised: false},
      orders: [],
      events: [],
      astrologsCount: astrologs,
      removedRoles: removedRoles,
      unoccupiedRoles: removedRoles,
    };
    const allRolesText = options.selectedRoles.reduce((text, r) => {return text + r.name + ", "}, "").slice(0, -2);
    newGame.events.push({text: "Dostępne role: " + allRolesText, visibility: "all"});
    if (removedRoles.length > 0)
    {
      const removedRolesText = removedRoles.reduce((text, r) => {return text + r.name + ", "}, "").slice(0, -2);
      newGame.events.push({text: "Na obozie nieobecni są: " + removedRolesText, visibility: "astrolodzy"});
    }
    newGame.allRoles = [...new Set(options.selectedRoles)];
    let bydlo = bydloCount;
    while (bydlo > 0)
    {
      const randRole = remainingRoles[Math.floor(Math.random() * remainingRoles.length)];
      if (randRole.side === 'astrolog')
        continue;
      bydlo--;
      randRole.side = "bydlo";
      remainingRoles.push(randRole);
    }
    const orders = [];
    let botDev = true;
    let forcedMember = null;
    let forcedRole = null;
    const players = members.filter(m => !m?.dev);
    if (options.bots > 0)  // at least one human must be astronom
    {
      if (players.length === 0)
        return;
      forcedMember = players[Math.floor(Math.random() * players.length)].id;
      if (remainingRoles.filter(r => r.side !== "astrolog").length === 0)
        return;
      while (!forcedRole)
      {
        const id = Math.floor(Math.random() * remainingRoles.length);
        const randRole = remainingRoles[id];
        if (randRole.side === "astrolog")
          continue;
        forcedRole = randRole;
        remainingRoles.splice(id, 1);
        break;
      }
    }
    members.filter(m => !m?.dev).forEach(member => {
      const id = Math.floor(Math.random() * remainingRoles.length);
      // const id = 0;
      let randRole = forcedRole;
      if (member.id !== forcedMember)
      {
        randRole = remainingRoles[id];
        remainingRoles.splice(id, 1);
      }
      const bydlo = (randRole.side === "bydlo");
      if (bydlo)
        randRole.side = "astronom";
      let order = randRole.order + newGame.seats.length;
      if (randRole.order < 0)
        order = randRole.order;
      if (order != null && order >= 0)
        orders.push(order);
      newGame.seats.push({id: member.id, username: member.clientData.username, role: randRole.name, side: randRole.side, order: order, bydlo: bydlo, bot: false, botDev: botDev});
      botDev = false;
    });
    for (let i = 0; i < options.bots; i++)
    {
      const id = Math.floor(Math.random() * remainingRoles.length);
      // const id = 0;
      const randRole = remainingRoles[id];
      const bydlo = (randRole.side === "bydlo");
      if (bydlo)
        randRole.side = "astronom";
      remainingRoles.splice(id, 1);
      let order = randRole.order + newGame.seats.length;
      if (randRole.order < 0)
        order = randRole.order;
      if (order != null && order >= 0)
        orders.push(order);
      newGame.seats.push({id: i+1, username: "bot_" + (i+1), role: randRole.name, side: randRole.side, order: order, bydlo: bydlo, bot: true})
    }
    const d = new Date();
    if (orders.length === 0 && options.timeOn)
      newGame.endTime = d.getTime() + options.time*60*1000;

    // randomizing seats
    const orderedSeats = [...newGame.seats];
    const randomizedSeats = [];
    while (orderedSeats.length > 0)
    {
      const id = Math.floor(Math.random() * orderedSeats.length);
      randomizedSeats.push(orderedSeats[id]);
      randomizedSeats[randomizedSeats.length - 1].seatId = randomizedSeats.length - 1;
      orderedSeats.splice(id, 1);
    }
    newGame.seats = randomizedSeats;

    // setting a dayKeeper (in multiplayer games), to add a delay before start of the day
    const randStart = Math.floor(Math.random() * newGame.seats.length);
    for (let i = 0; i < newGame.seats.length; i++)
    {
      const j = (i + randStart) % newGame.seats.length;
      if (newGame.seats[j].order !== newGame.orders[newGame.orders.length - 1])
      {
        newGame.seats[j].dayKeeper = true;
        orders.push(999999); // dayKeeper order is last
        break;
      }
    }
    
    newGame.orders = orders.sort(function(a, b) {return a - b; });
    setGameState(newGame);
  }

  function addRole(role)
  {
    if (role.name === "Bydło")
    {
      if (bydloCount < 2)
        setBydloCount(prev => prev + 1);
      return;
    }
    if (role.order != null && role.order >= 0 && options.selectedRoles.filter(r => r.name === role.name).length >= 10)
      return;
    setSelectedRoles([...options.selectedRoles, role]);
  }
  
  function removeRole(role)
  {
    if (role.name === "Bydło")
    {
      if (bydloCount > 0)
        setBydloCount(prev => prev - 1);
      return;
    }
    const toRemove = options.selectedRoles.filter(r => r.name === role.name);
    if (toRemove.length === 0)
      return;
    const toRemoveId = options.selectedRoles.indexOf(toRemove[0]);
    let roles = [...options.selectedRoles];
    roles.splice(toRemoveId, 1);
    setSelectedRoles(roles);
  }

  function getPhaseText(role)
  {
    if (role.order === -1)
      return <><Sun size={12}/>   Zdolność dzienna   <Sun size={12}/></>
    return <><Moon size={12}/>   Zdolność nocna   <Moon size={12}/></>
  }

  if (!members)
    return null;

  return (
    <>
    <div>
      <div className="lobbyTitle">Game Lobby</div>
      <div className="lobbyTop">
        <button className="lobbyButtonStart" onClick={createGame} disabled={options.selectedRoles.length + bydloCount < members.length + options.bots - devs}>Start</button>
        <button className="lobbyButtonStart" onClick={() => setSetupsModalOpen(true)}>Często Używane Setupy</button>
      </div>
      <div>Wybrane role: {options.selectedRoles.length + bydloCount} / {members.length + options.bots - devs}</div>
      <div className="lobbyRolesGrid">
        {ROLES.map(role => <div key={role.name} className={`lobbyRole ${options.selectedRoles.filter(r => r.name === role.name).length === 0 ? "lobbyRoleInactive" : ""}`}>
          <div className="lobbyRoleTop">
            <p className={`roleName ${options.bots > 0 && noBotRoles.includes(role.name) ? "roleNameRed" : ""}`}>{role.name}</p>
            <p className={"roleSide" && (role.side === "astrolog" ? styles.roleAstrolog : undefined)}>{role.side}</p>
            {role.order != null && <div className="roleTime">{getPhaseText(role)}</div>}
            <span className="roleDesc">{role.desc}</span>
            <span className="roleLore">{role.lore}</span>
          </div>
          <div className="lobbyRoleSelector">
            <button className="lobbySelectorButton" onClick={() => removeRole(role)}>-</button>
            <span className="lobbySelectorNumber">{role.name === "Bydło" ? bydloCount : options.selectedRoles.filter(r => r.name === role.name).length}</span>
            <button className="lobbySelectorButton" onClick={() => addRole(role)}>+</button>
          </div>
        </div>)}
      </div>
    </div>
    <OftenUsedSetups open={setupsModalOpen} setOpen={setSetupsModalOpen} options={options} setOptions={setOptions} ROLES={ROLES}/>
    </>
  );
}
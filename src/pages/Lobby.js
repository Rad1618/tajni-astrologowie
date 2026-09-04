import { useState } from "react";
import OftenUsedSetups from "../modals/OftenUsedSetups";
import styles from "../styles/lobby.css"

const ROLES = [
  {name: "Astrolog", side: "astrolog", order: 0, desc: "Nie ma specjalnej zdolności.", lore: "Ale bardzo chciałby jakąś mieć."},
  {name: "Astrolog medyczny", side: "astrolog", order: 20, desc: "Wybierz siedzącą obok osobę. Ta osoba staje się niewyspana.", lore: "Nikt się nie zorientuje, że to kawa bez kofeiny."},
  {name: "Astrolog holistyczny", side: "astrolog", order: 30, desc: "Obie osoby siedzące obok ciebie stają się niewyspane.", lore: "Jego wykłady usypiają nawet najsilniejszych."},
  {name: "Manipulator", side: "astrolog", order: 10, desc: "Zamienia w astrologa wybranego astronoma. Nowy astrolog nie poznaje innych.", lore: "Oni nie chcą, abyś mi uwierzył."},
  {name: "Astrolog biurokratyczny", side: "astrolog", order: 40, desc: "Dopóki pozostaje na obozie, nie ujawnia się ról osób wyrzuconych.", lore: "Wszystko jest w papierach."},
  {name: "Komendant", side: "astronom", order: -1, desc: "Użyj funkcji wybranego astronoma.", lore: "Zbiórka kadry!"},
  {name: "Dinozaur", side: "astronom", order: -1, desc: "Ujawnij swoją rolę.", lore: "Był tu od zawsze. On jest pewny."},
  {name: "Mini-Medyk", side: "astronom", order: 110, desc: "Leczy z niewyspania swoich sąsiadów. Dowiaduje się, ile osób uleczył.", lore: "Intensywne leczenie kofeiną."},
  // {name: "Medyk", side: "astronom", order: 120, desc: "Leczy z niewyspania 4 osoby wokół siebie. Dowiaduje się, ile osób uleczył.", lore: "Kroplówka z energetyka."},
  {name: "Wych", side: "astronom", order: 200, desc: "Poznaje odległość do najbliższego niewyspanego.", lore: "Szósty zmysł."},
  {name: "Zły oboźny", side: "astronom", order: -1, desc: "Wskaż osobę. Jeśli jest astrologiem, zostaje wyeliminowana z gry.", lore: "Na polanie króluje..."},
  {name: "Kwatermistrz", side: "astronom", order: 210, desc: "Poznaje rolę jednego ze swoich sąsiadów.", lore: "Tylko on mógłby w taki sposób wbijać śledzie."},
  {name: "Mistrz obserwacji", side: "astronom", order: 100, desc: "Wybierz jedną osobę. Ta osoba staje się niewyspana. Dowiadujesz się, czy jest astrologiem.", lore: "Niebo żyleta, obsy do rana!"},
  {name: "Planmistrz", side: "astronom", order: 220, desc: "Poznajesz 3 osoby, z których dokładnie jedna jest astrologiem.", lore: "Napiszcie abstrakty!"},
  {name: "Mistrz gry", side: "astronom", order: -1, desc: "Wskaż 3 osoby. Poznaj ilość astrologów wśród nich.", lore: "Nasi szybciej by to załapali."},
  {name: "Dyżurny", side: "astronom", order: 250, desc: "Poznaj odległość do najbliższego astrologa.", lore: "Zaraz, a co to jest o tam?"},
  {name: "Bydło", side: "astronom", order: 0, desc: "Bydło kopiuje rolę innego astronoma, ale otrzymuje fałszywe informacje. Bydło nie wie, że jest bydłem.", lore: "Kadra robi bydło!"},
  {name: "Gitarzysta", side: "astronom", order: 230, desc: "Poznajesz ilość astrologów siedzących obok ciebie.", lore: "Oni coś podejrzanie inaczej śpiewają."},
  {name: "Antyswatus", side: "astronom", order: 240, desc: "Dowiadujesz się, ile par siedzących obok siebie astrologów istnieje.", lore: "Ta dzisiejsza młodzież!"},
  {name: "Fizyk", side: "astronom", order: -1, desc: "Wskaż wybraną osobę. Dowiesz się, czy wyrzucenie tej osoby spowoduje koniec gry i kto wygra.", lore: "Zróbmy eksperyment myślowy."},
  {name: "Chemik", side: "astronom", order: -1, desc: "Wskaż dwie osoby. Dowiesz się, czy jest wśród nich co najmniej jedna zła.", lore: "Co tak pachnie?"},
  {name: "Ekonomista", side: "astronom", order: 260, desc: "Poznaje stronę (lewą lub prawą), po której jest więcej astrologów.", lore: "Da się to jakoś policzyć."},
  {name: "Astronom sferyczny", side: "astronom", order: 270, desc: "Poznaj stronę, w którą jest najbliższy astrolog.", lore: "To półkole jest zdecydowanie bardziej podejrzane."},
  {name: "Kierowca", side: "astronom", order: 280, desc: "Zawsze wie, czy jest niewyspany. Mówi prawdę nawet będąc niewyspanym.", lore: "8 godzin na SORze i jeszcze trzeba wrócić."},

  // {name: "Wych", side: "astronom", order: 0, desc: "", lore: ""},
]

const noBotRoles = ["Komendant", "Zły oboźny", "Manipulator", "Bydło"];

export default function Lobby({gameState, setGameState, members, options, setOptions})
{
  const [bydloCount, setBydloCount] = useState(0);
  const devs = members ? members.filter(m => m?.dev).length : 0;

  const [setupsModalOpen, setSetupsModalOpen] = useState(false);

  function setSelectedRoles(roles)
  {
    console.log(roles);
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
      unoccupiedRoles: removedRoles
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
    if (options.bots > 0)  // at least one human must be astronom
    {
      const players = members.filter(m => !m?.dev);
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
      let order = randRole.order + remainingRoles.filter(r => r.name === randRole.name).length;
      if (randRole.order < 0)
        order = randRole.order;
      if (order != null && order >= 0)
        orders.push(order);
      newGame.seats.push({seatId: newGame.seats.length, id: member.id, username: member.clientData.username, role: randRole.name, side: randRole.side, order: order, bydlo: bydlo, bot: false, botDev: botDev});
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
      let order = randRole.order + remainingRoles.filter(r => r.name === randRole.name).length;
      if (randRole.order < 0)
        order = randRole.order;
      if (order != null && order >= 0)
        orders.push(order);
      newGame.seats.push({seatId: newGame.seats.length, id: i+1, username: "bot_" + (i+1), role: randRole.name, side: randRole.side, order: order, bydlo: bydlo, bot: true})
    }
    newGame.orders = orders.sort(function(a, b) {return a - b; });
    const d = new Date();
    if (orders.length === 0)
      newGame.endTime = d.getTime() + options.time*60*1000;
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
            {role.order != null && <div className="roleTime">{role.order === -1 ? "Zdolność dzienna:" : "Zdolność nocna:"}</div>}
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
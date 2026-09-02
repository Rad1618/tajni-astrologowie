import { useState } from "react";
import styles from "../styles/lobby.css"

const ROLES = [
  {name: "Astrolog", side: "astrolog", order: 0, desc: "Nie ma specjalnej zdolności.", lore: "Ale bardzo chciałby jakąś mieć."},
  {name: "Astrolog medyczny", side: "astrolog", order: 20, desc: "Wybierz siedzącą obok osobę. Ta osoba staje się niewyspana.", lore: "Nikt się nie zorientuje, że to kawa bez kofeiny."},
  {name: "Astrolog holistyczny", side: "astrolog", order: 30, desc: "Obie osoby siedzące obok ciebie stają się niewyspane.", lore: "Jego wykłady usypiają nawet najsilniejszych."},
  {name: "Manipulator", side: "astrolog", order: 10, desc: "Zamienia w astrologa wybranego astronoma. Nowy astrolog nie poznaje innych.", lore: "Oni nie chcą, abyś mi uwierzył."},
  {name: "Astrolog biurokratyczny", side: "astrolog", order: 40, desc: "Dopóki pozostaje na obozie, nie ujawnia się ról osób wyrzuconych.", lore: "Wszystko jest w papierach."},
  {name: "Komendant", side: "astronom", order: -1, desc: "Użyj funkcji wybranego astronoma.", lore: "Zbiórka kadry!"},
  {name: "Dinozaur", side: "astronom", order: -1, desc: "Ujawnij swoją rolę.", lore: "Był tu od zawsze. On jest pewny."},
  {name: "Mini-Medyk", side: "astronom", order: 110, desc: "Leczy z niewyspania swoich sąsiadów. Dowiaduje się, ile osób uleczył.", lore: "Intensywne leczenie kofeiną"},
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

  // {name: "Wych", side: "astronom", order: 0, desc: "", lore: ""},
]

export default function Lobby({gameState, setGameState, members, bots})
{
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [bydloCount, setBydloCount] = useState(0);
  const admins = members ? members.filter(m => m?.admin).length : 0;

  function createGame()
  {
    if (!members)
      return;
    if (selectedRoles.length + bydloCount < members.length + bots - admins)
      return;
    let overflow = selectedRoles.length + bydloCount - members.length - bots + admins;
    let astrologs = 0;
    for (let i = 0; i < selectedRoles.length; i++)
    {
      if (selectedRoles[i].side === "astrolog")
        astrologs++;
    }
    // There cannot be more astrologs than available seats
    if (astrologs > members.length + bots)
      return;
    let remainingRoles = [...selectedRoles];
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

    const newGame = {version: 0, seats: [], voting: {active: false, finalised: false}, orders: [], events: [], astrologsCount: astrologs, removedRoles: removedRoles};
    const allRolesText = selectedRoles.reduce((text, r) => {return text + r.name + ", "}, "").slice(0, -2);
    newGame.events.push({text: "Dostępne role: " + allRolesText, visibility: "all"});
    if (removedRoles.length > 0)
    {
      const removedRolesText = removedRoles.reduce((text, r) => {return text + r.name + ", "}, "").slice(0, -2);
      newGame.events.push({text: "Na obozie nieobecni są: " + removedRolesText, visibility: "astrolodzy"});
    }
    newGame.allRoles = [...new Set(selectedRoles)];
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
    let botAdmin = true;
    members.filter(m => !m?.admin).forEach(member => {
      // const id = Math.floor(Math.random() * remainingRoles.length);
      const id = 0;
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
      newGame.seats.push({seatId: newGame.seats.length, id: member.id, username: member.clientData.username, role: randRole.name, side: randRole.side, order: order, bydlo: bydlo, bot: false, botAdmin: botAdmin});
      botAdmin = false;
    });
    for (let i = 0; i < bots; i++)
    {
      // const id = Math.floor(Math.random() * remainingRoles.length);
      const id = 0;
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
    if (role.order != null && role.order >= 0 && selectedRoles.filter(r => r.name === role.name).length >= 10)
      return;
    setSelectedRoles(prev => [...prev, role]);
  }
  
  function removeRole(role)
  {
    if (role.name === "Bydło")
    {
      if (bydloCount > 0)
        setBydloCount(prev => prev - 1);
      return;
    }
    const toRemove = selectedRoles.filter(r => r.name === role.name);
    if (toRemove.length === 0)
      return;
    const toRemoveId = selectedRoles.indexOf(toRemove[0]);
    let roles = [...selectedRoles];
    roles.splice(toRemoveId, 1);
    setSelectedRoles(roles);
  }

  if (!members)
    return null;

  return (
    <div>
      <div className="lobbyTitle">Game Lobby</div>
      <button className="lobbyButtonStart" onClick={createGame} disabled={selectedRoles.length + bydloCount < members.length + bots - admins}>Start</button>
      <div>Wybrane role: {selectedRoles.length + bydloCount} / {members.length + bots - admins}</div>
      <div className="lobbyRolesGrid">
        {ROLES.map(role => <div key={role.name} className="lobbyRole">
          <div className="lobbyRoleTop">
            <p className="roleName">{role.name}</p>
            <p className={"roleSide" && (role.side === "astrolog" ? styles.roleAstrolog : undefined)}>{role.side}</p>
            {role.order != null && <div className="roleTime">{role.order === -1 ? "Zdolność dzienna:" : "Zdolność nocna:"}</div>}
            <span className="roleDesc">{role.desc}</span>
            <span className="roleLore">{role.lore}</span>
          </div>
          <div className="lobbyRoleSelector">
            <button className="lobbySelectorButton" onClick={() => removeRole(role)}>-</button>
            <span className="lobbySelectorNumber">{role.name === "Bydło" ? bydloCount : selectedRoles.filter(r => r.name === role.name).length}</span>
            <button className="lobbySelectorButton" onClick={() => addRole(role)}>+</button>
          </div>
        </div>)}
      </div>
    </div>
  );
}
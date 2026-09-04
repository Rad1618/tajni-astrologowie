import { Fragment } from 'react/jsx-runtime';
import '../styles/modals.css';

const SETUPS = [
  {name: "Śpiewanki (7 miejsc)", bots: 0, roles: ["Astrolog", "Astrolog", "Astrolog medyczny", "Gitarzysta", "Gitarzysta", "Gitarzysta", "Gitarzysta"]},
  {name: "Standard Solo (1 gracz)", bots: 6, roles: ["Astrolog", "Astrolog", "Astrolog medyczny", "Planmistrz", "Gitarzysta", "Antyswatus", "Mistrz obserwacji", "Ekonomista"]},
  {name: "Standard (bez botów, 8 miejsc)", bots: 0, roles: ["Astrolog biurokratyczny", "Astrolog medyczny", "Astrolog medyczny", "Komendant", "Chemik", "Wych", "Mistrz Obserwacji", "Gitarzysta", "Antyswatus"]},
  {name: "Dzień dobry (bez botów, 7 miejsc)", bots: 0, roles: ["Astrolog biurokratyczny", "Astrolog biurokratyczny", "Astrolog holistyczny", "Komendant", "Dinozaur", "Mistrz gry", "Zły oboźny", "Fizyk", "Chemik"]},
];

export default function OftenUsedSetups({open, setOpen, options, setOptions, ROLES})
{
  function runSetup(setup)
  {
    setOpen(false);
    const roles = setup.roles.map(role => ROLES.find(r => r.name === role));
    setOptions({...options, bots: setup.bots, selectedRoles: roles});
  }

  if (!open)
    return null;

  return <div className="modalOverlay">
    <div className="modalPanel">
      <div className="modalHeader">Często Używane Setupy</div>
      <div className='modalBaseGrid'>
        {SETUPS.map(setup => <Fragment key={setup.name}>
          <button className='modalGridButton' onClick={() => runSetup(setup)}></button>
          <div>{setup.name}</div>
        </Fragment>)}
      </div>
      <button className='modalButton' onClick={() => setOpen(false)}>Close</button>
    </div>
  </div>
}
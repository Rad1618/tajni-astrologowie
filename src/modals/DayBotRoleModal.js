import { useMemo, useState } from "react";
import Select from "react-select";
import '../styles/modals.css';

export default function DayBotRoleModal({open, onClose, botSeat, gameState, activateAction, getTargets})
{
  const [selection, setSelection] = useState([]);

  const botRole = botSeat?.falseRole ?? botSeat?.role ?? "User";

  const targets = useMemo(() => {
    if (!botSeat)
      return {possibleSelection: [], N: 0};
    return getTargets(botSeat.seatId, botRole);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botSeat, botRole]);

  function closeModal()
  {
    setSelection([]);
    onClose();
  }

  function onActivate(e)
  {
    e.preventDefault();
    activateAction(selection, botRole, botSeat.seatId, botSeat?.falseDayRole, true);
    closeModal();
  }
  
  if (!open)
    return null;

  return <div className="modalOverlay">
    <div className="modalPanel">
      <div className="modalHeader">Dzienna Rola Bota</div>
      <span>Bot {botSeat?.username} twierdzi, że jego rola to {botRole}.</span>
      {targets.N > 0 && targets.possibleSelection && <>
        <span>Ta rola wymaga wybrania {targets.N} {targets.N > 1 ? "graczy" : "gracza"}.</span>
        <Select className="modalSelect marginBottom" isMulti={targets.N > 1}
          value={selection.map(s => {return {value: s, label: gameState.seats[s].username};})}
          onChange={(values) => {targets.N > 1 ? setSelection(values.map(v => v.value)) : setSelection([values.value])}}
          options={
            targets.possibleSelection.map((s) => {return {value: s, label: gameState.seats[s].username};})
        }/>
      </>}
      <div className="modalButtons">
        <button disabled={targets.N !== selection.length} className='modalButton' onClick={onActivate}>Aktywuj</button>
        <button className='modalButton' onClick={closeModal}>Zamknij</button>
      </div>
    </div>
  </div>
}
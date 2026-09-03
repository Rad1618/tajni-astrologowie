import '../styles/modals.css';

export default function VotingModal({gameState, setGameState, me, options})
{
  const isActive = gameState?.voting?.active ?? false;
  const canVote = (!gameState?.seats.filter((s) => s.id === me.id)[0]?.removed || false) ?? false;
  const alreadyVoted = ((me?.id || null) in (gameState?.voting?.votes || {})) ?? false;
  const targetSeat = gameState?.voting?.target ? gameState.seats.find(s => s.id === gameState.voting.target) || {} : {};

  const removed = gameState?.seats.filter((s) => (s?.removed && !s?.bot) ?? false).length;

  function voteSucceded(votes)
  {
    let trues = 0;
    Object.values(votes).forEach(v => trues += v ? 1 : 0);
    return trues > Object.values(votes).length / 2;
  }

  function castVote(e, vote)
  {
    e.preventDefault();
    let seats = gameState?.seats ?? [];
    let votes = {
      ...gameState?.voting?.votes,
      [me.id]: vote,
    }
    const events = gameState?.events ?? [];
    const finalised = Object.keys(votes).length >= gameState.seats.length - options.bots - removed;
    let endTime = gameState.endTime;
    if (finalised)
    {
      votes = botVoting(votes);
      const d = new Date();
      endTime += d.getTime() - gameState.voting.startTime;
      if (voteSucceded(votes))
      {
        endTime += options.bonusTime * 60*1000;
        events.push({text: targetSeat.username + " zostaje wyrzucony z obozu.", visibility: "all"});
        seats = seats.map(s => {
          if (s.id === targetSeat.id)
            return {...s, removed: true};
          return s;
        })
      }
      else
        events.push({text: targetSeat.username +  " zostaje na obozie.", visibility: "all"});
    }
    setGameState({...gameState, seats: seats, endTime: endTime,
      voting:
      {
        ...gameState?.voting ?? {},
        active: !finalised,
        finalised: finalised,
        votes: votes,
      },
      events: events,
    });
  }

  function botVoting(votes)
  {
    const astronoms = gameState.seats.filter(s => s.side === "astronom" && !s?.bot);
    const astrologs = gameState.seats.filter(s => s.side === "astrolog" && !s?.bot);
    const bots = gameState.seats.filter(s => s?.bot);
    bots.forEach((b) => {
      let humanId = null;
      if (b.side === "astrolog" && astrologs.length > 0)
        humanId = astrologs[Math.floor(Math.random() * astrologs.length)].id;
      else
        humanId = astronoms[Math.floor(Math.random() * astronoms.length)].id;
      votes[b.id] = votes?.[humanId] ?? true;
    });
    return votes;
  }

  if (!isActive || alreadyVoted || !canVote)
    return null;

  return <div className="modalOverlay">
    <div className="modalPanel">
      <div className="modalHeader">Głosowanie</div>
      <div>Wyrzucenie {targetSeat.username} z obozu</div>
      <div>Czy jeteś za?</div>
      <div className="modalButtons">
        <button className="modalButtonYes" onClick={(e) => castVote(e, true)}>Tak</button>
        <button className="modalButtonNo" onClick={(e) => castVote(e, false)}>Nie</button>
      </div>
    </div>
  </div>
}
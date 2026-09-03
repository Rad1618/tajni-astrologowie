import { useState, useEffect } from 'react';
import '../styles/game.css';

export default function GameBoard({gameState, setGameState, seat, me, checkWin, options}) {
  const [seats, setSeats] = useState([]);
  const [canBeSelected, setCanBeSelected] = useState([]);
  const [isSelected, setIsSelected] = useState([]);
  const [actionText, setActionText] = useState("");
  const [confirmButtonVisible, setConfirmButtonVisible] = useState(false);
  const [komendantOption, setKomendantOption] = useState(null);
  const [komendantRole, setKomendantRole] = useState(null);

  const isNight = gameState.orders.length > 0;
  const isVoting = gameState?.voting?.active ?? false;
  const isUser = seat < 0;
  const isDev = me?.dev;
  const mySeat = isUser || gameState.seats.length <= seat ? {} : gameState.seats[seat];
  const myAction = !mySeat?.usedUp && (((isNight && gameState.orders[0] === mySeat?.order) || (!isNight && mySeat?.order < 0)));
  const votes = gameState?.voting?.finalised ? gameState.voting.votes : null;
  const hideRemoved = gameState.seats.reduce((state, s) => {
    if (state) return true;
    if (s.role === "Astrolog biurokratyczny" && !(s?.removed || false))
      return true;
    return false;
  }, false);

  const role = (komendantRole ? komendantRole : mySeat.role) || "User";

  function createPlayerText(seat)
  {
    const showAll = isDev || gameState?.ended;
    let text = seat.username;
    let additionalSymbols = "";
    if (showAll)
    {
      if (seat.sleepless)
        additionalSymbols += "💤";
      if (seat.bydlo)
        additionalSymbols += "🐂";
      if (seat.usedUp)
        additionalSymbols += "🏁";
    }
    if (showAll || seat.id === me.id || (seat?.removed && !hideRemoved) || seat?.visible)
      text += " (" + seat.role + " " + (seat.side === "astrolog" ? "🙁" : "") + additionalSymbols + ")";
    else if (mySeat.side === "astrolog" && !mySeat.manipulated && seat.side === "astrolog")
    {
      if (seat.manipulated)
        text += " (🙁" + additionalSymbols + ")";
      else
        text += " (" + seat.role + " " + (seat.side === "astrolog" ? "🙁" : "") + additionalSymbols + ")";
    }
    return text;
  }

  function startVoting(e, target)
  {
    e.preventDefault();
    setGameState({
      ...gameState,
      voting: {active: true, finalised: false, target: target, startTime: new Date().getTime()}
    });
  }

  function shouldGenerateFalseData(s)
  {
    return (s?.sleepless || false) !== (s?.bydlo || false);
  }

  useEffect(() => {
    if (!gameState?.seats)
    {
      setSeats(gameState?.seats || []);
      return;
    }
    const newSeats = [];
    const side = Math.floor((gameState.seats.length - 1) / 2);
    const NormalisedSeat = seat < 0 ? 0 : seat;
    if (gameState.seats.length % 2 === 0)
    {
      newSeats.push(null);
      newSeats.push(gameState.seats[(NormalisedSeat + side + 1) % gameState.seats.length]);
      newSeats.push(null);
    }
    for (let i = 0; i < side; i++)
    {
      newSeats.push(gameState.seats[(NormalisedSeat - side + i + gameState.seats.length) % gameState.seats.length]);
      newSeats.push(null);
      newSeats.push(gameState.seats[(NormalisedSeat + side - i) % gameState.seats.length]);
    }
    newSeats.push(null);
    newSeats.push(gameState.seats[NormalisedSeat]);
    newSeats.push(null);
    setSeats(newSeats);
  }, [gameState, isUser]);

  useEffect(() => {
    if (isUser || !gameState?.seats || !gameState.seats[seat].botDev || gameState?.botsDone)
      return;
    if (gameState.orders.length === 0)  // day bot roles
    {
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (gameState.seats[i].bot && !gameState.seats[i].botDone)
        {
          if (gameState.seats[i].side !== "astrolog")
            botAction(i, gameState.seats[i]);
          else
          {
            const possibleRoles = gameState.allRoles.filter(r => r.side !== "astrolog" && r.name !== "Dinozaur");
            const randRole = possibleRoles[Math.floor(Math.random() * possibleRoles.length)].name;
            const targets = simulateTargetSelection(i, randRole);
            activateAction(targets, randRole, i, true);
          }
          return;
        }
      }
      // all bots done
      // trzebaby poprawić filter, bo teraz się załamie przy byt wielu botach
      let botEvents = gameState.events.filter(e => e.visibility.toString().length <= 2);
      const newEvents = [];
      while (botEvents.length > 0)
      {
        const randId = Math.floor(Math.random() * botEvents.length);
        const event = botEvents[randId];
        botEvents.splice(randId, 1);
        let botName = "";
        let botRole = "";
        for (let i = 0; i < gameState.seats.length; i++)
        {
          if (gameState.seats[i].id === event.visibility)
          {
            botName = gameState.seats[i].username;
            botRole = gameState.seats[i]?.eventRole ?? gameState.seats[i].role;
            break;
          }
        }
        newEvents.push({text: botName + " (" + botRole + "): " + event.text, visibility: "all"});
      }
      setGameState({...gameState, botsDone: true, events: [...gameState.events, ...newEvents]});
    }
    else  // night bot roles
    {
      for (let i = 0; i < gameState.seats.length; i++)
      {
        // checking if bot player has now action
        if (gameState.seats[i].bot && gameState.orders[0] === gameState.seats[i].order)
        {
          botAction(i, gameState.seats[i]);
          return;
        }
      }
    }
  }, [gameState, seat])

  function botAction(botId, botSeat)
  {
    let orders = [...gameState?.orders] ?? [];
    orders.splice(0, 1);

    const targets = simulateTargetSelection(botId, botSeat.role);
    activateAction(targets, botSeat.role, botId);
  }

  useEffect(() => {
    if (!myAction || !mySeat)
    {
      setCanBeSelected([]);
      return;
    }
    const selection = [];
    if (role === "Astrolog")
    {
      setActionText("Kliknij przycisk, jak będziesz gotowy.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Astrolog medyczny")
    {
      setActionText("Wybierz jednego z astronomów do niewyspania.");
      setConfirmButtonVisible(false);
      for (let i = seat + 1; i < seat + gameState.seats.length; i++)
      {
        if (gameState.seats[i % gameState.seats.length].side !== "astrolog")
        {
          selection.push(i % gameState.seats.length);
          break;
        }
      }
      for (let i = seat - 1 + gameState.seats.length; i > seat; i--)
      {
        if (gameState.seats[i % gameState.seats.length].side !== "astrolog")
        {
          if (!selection.includes(i % gameState.seats.length))
            selection.push(i % gameState.seats.length);
          break;
        }
      }
    }
    else if (role === "Astrolog holistyczny")
    {
      setActionText("Niewysypiasz dwóch najbliższych astronomów po obu stronach.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Manipulator")
    {
      setActionText("Wybierz astronoma do zmanipulowania.");
      setConfirmButtonVisible(false);
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (gameState.seats[i].side !== "astrolog")
          selection.push(i);
      }
    }
    else if (role === "Astrolog biurokratyczny")
    {
      setActionText("Kliknij przycisk, jak będziesz gotowy.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Komendant")
    {
      setActionText("Aktywuj zdolność innego astronoma.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Dinozaur")
    {
      setActionText("Możesz ujawnić swoją rolę (ale nie stronę).");
      setConfirmButtonVisible(true);
    }
    else if (role === "Mini-Medyk")
    {
      setActionText("Uleczysz z niewyspania swoich sąsiadów, dowiesz się, ilu uleczyłeś.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Wych")
    {
      setActionText("Dowiesz się, w jakiej odległości od Ciebie znajduje się najbliższy niewyspany.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Zły oboźny")
    {
      if (options.gorszyObozny)
        setActionText("Możesz wyrzucić z obozu wybranego astrologa. Jeśli wskarzesz astronoma, nic się nie stanie. Chyba, że jesteś niewyspany.");
      else
        setActionText("Możesz wyrzucić z obozu wybranego astrologa. Jeśli wskarzesz astronoma, nic się nie stanie.");
      setConfirmButtonVisible(false);
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (i !== seat)
          selection.push(i);
      }
    }
    else if (role === "Kwatermistrz")
    {
      setActionText("Dowiesz się roli jednego ze swoich sąsiadów.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Mistrz obserwacji")
    {
      setActionText("Wybierz osobę na obsy. Będzie niewyspana, ale dowiesz się, czy jest astrologiem.");
      setConfirmButtonVisible(false);
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (i !== seat)
          selection.push(i);
      }
    }
    else if (role === "Planmistrz")
    {
      setActionText("Wśród trzech losowych osób, będzie dokładnie 1 astrolog.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Mistrz gry")
    {
      setActionText("Wybierz 3 osoby i poznaj ilu jest wśród nich astrologów.");
      setConfirmButtonVisible(false);
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (i !== seat)
          selection.push(i);
      }
    }
    else if (role === "Dyżurny")
    {
      setActionText("Dowiesz się, w jakiej odległości od Ciebie znajduje się najbliższy astrolog.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Gitarzysta")
    {
      setActionText("Poznasz liczbę astrologów siedzących obok Ciebie.");
      setConfirmButtonVisible(true);
    }
    else if (role === "Antyswatus")
    {
      setActionText("Poznasz liczbę parek astrologów (astrologów siedzących obok siebie).");
      setConfirmButtonVisible(true);
    }
    else if (role === "Fizyk")
    {
      setActionText("Wybierz osobę, której wyrzucenie chciałbyś zasymulować.");
      setConfirmButtonVisible(false);
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (i !== seat)
          selection.push(i);
      }
    }
    else if (role === "Chemik")
    {
      setActionText("Wybierz 3 osoby i dowiedz się, czy jest wśród nich astrolog.");
      setConfirmButtonVisible(false);
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (i !== seat)
          selection.push(i);
      }
    }
    else if (role === "Ekonomista")
    {
      setActionText("Dowiesz się, po której stronie jest więcej astrologów (lub remis).");
      setConfirmButtonVisible(true);
    }
    else if (role === "Astronom sferyczny")
    {
      setActionText("Sprawdź, w którą stronę jest najbliższy astrolog (lub remis).");
      setConfirmButtonVisible(true);
    }
    setCanBeSelected(selection);
  }, [myAction, role]);

  function simulateTargetSelection(botSeat, botRole)
  {
    const possibleSelection = [];
    let N = 0;
    if (botRole === "Astrolog medyczny")
    {
      N = 1;
      for (let i = botSeat + 1; i < botSeat + gameState.seats.length; i++)
      {
        if (gameState.seats[i % gameState.seats.length].side !== "astrolog")
        {
          possibleSelection.push(i % gameState.seats.length);
          break;
        }
      }
      for (let i = botSeat - 1 + gameState.seats.length; i > botSeat; i--)
      {
        if (gameState.seats[i % gameState.seats.length].side !== "astrolog")
        {
          if (!possibleSelection.includes(i % gameState.seats.length))
            possibleSelection.push(i % gameState.seats.length);
          break;
        }
      }
    }
    else if (botRole === "Manipulator")
    {
      N = 1;
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (gameState.seats[i].side !== "astrolog")
          possibleSelection.push(i);
      }
    }
    else
    {
      N = 1;
      for (let i = 0; i < gameState.seats.length; i++)
      {
        if (i !== botSeat)
          possibleSelection.push(i);
      }
    }
    if (botRole === "Chemik")
      N = 2;
    else if (botRole === "Mistrz gry")
      N = 3;
    const selection = [];
    while (N > 0 && possibleSelection.length > 0)
    {
      const randId = Math.floor(Math.random() * possibleSelection.length);
      selection.push(possibleSelection[randId]);
      possibleSelection.splice(randId, 1);
      N--;
    }
    return selection;
  }

  function actionTargetSelected(target)
  {
    if (isSelected.includes(target))
    {
      const id = isSelected.indexOf(target);
      let newSelection = [...isSelected];
      newSelection.splice(id, 1);
      setIsSelected(newSelection);
      return;
    }
    const newSelection = [...isSelected, target];
    setIsSelected(newSelection);
    activateAction(newSelection, role, seat);
  }

  function activateAction(selectionA, roleA, seatA, lie=false)
  {
    const isBot = gameState.seats[seatA].bot;
    if (!isBot && (!myAction || (selectionA.length === 0 && !confirmButtonVisible)))
      return;
    const seatId = isBot ? gameState.seats[seatA].id : mySeat.id;
    const newState = {...gameState};
    if (isBot && (newState.seats[seatA].side !== "astrolog" || lie))
    {
      newState.seats[seatA].botDone = true;
      newState.seats[seatA].eventRole = roleA;
    }
    if (roleA === "Astrolog" || roleA === "Astrolog biurokratyczny")
    {
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      setGameState(newState);
    }
    else if (roleA === "Astrolog medyczny")
    {
      if (selectionA.length !== 1)
        return;
      newState.seats[selectionA[0]].sleepless = true;
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.events.push({text: newState.seats[selectionA[0]].username + " jest niewyspany.", visibility: "astrolodzy"});
      setGameState(newState);
    }
    else if (roleA === "Astrolog holistyczny")
    { 
      for (let i = seatA + 1; i < seatA + newState.seats.length; i++)
      {
        if (newState.seats[i % newState.seats.length].side !== "astrolog")
        {
          newState.seats[i % newState.seats.length].sleepless = true;
          newState.events.push({text: newState.seats[i % newState.seats.length].username + " jest niewyspany.", visibility: "astrolodzy"});
          break;
        }
      }
      for (let i = seatA - 1 + newState.seats.length; i > seatA; i--)
      {
        if (newState.seats[i % newState.seats.length].side !== "astrolog")
        {
          newState.seats[i % newState.seats.length].sleepless = true;
          newState.events.push({text: newState.seats[i % newState.seats.length].username + " jest niewyspany.", visibility: "astrolodzy"});
          break;
        }
      }
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      setGameState(newState);
    }
    else if (roleA === "Manipulator")
    {
      if (selectionA.length !== 1)
        return;
      newState.seats[selectionA[0]].side = "astrolog";
      newState.seats[selectionA[0]].manipulated = true;
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.events.push({text: newState.seats[selectionA[0]].username + " jest od teraz astrologiem.", visibility: "astrolodzy"});
      newState.events.push({text: "Zostałeś astrologiem. Od teraz wygrywasz z astrologami.", visibility: newState.seats[selectionA[0]].id});
      setGameState(newState);
    }
    else if (roleA === "Komendant")
    {
      if (komendantOption)
        setKomendantRole(komendantOption);
    }
    else if (roleA === "Dinozaur")
    {
      newState.seats[seatA].visible = true;
      newState.seats[seatA].usedUp = true;
      newState.events.push({text: newState.seats[seatA].username + " ujawnia się, jako " + mySeat.role, visibility: "all"});
      setGameState(newState);
    }
    else if (roleA === "Mini-Medyk")
    {
      let count = 0;
      if (newState.seats[(seatA + 1) % newState.seats.length].sleepless)
        count++;
      if (newState.seats[(seatA - 1 + newState.seats.length) % newState.seats.length].sleepless)
        count++;
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        let newCount = count;
        while (newCount === count)
          newCount = Math.floor(Math.random() * 3);
        count = newCount;
      }
      if (!lie)
      {
        newState.seats[(seatA + 1) % newState.seats.length].sleepless = false;
        newState.seats[(seatA - 1 + newState.seats.length) % newState.seats.length].sleepless = false;
      }
      newState.events.push({text: "Uleczyłeś " + count + " osób.", visibility: seatId})
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Wych")
    {
      let closest = -1;
      for (let i = seatA + 1; i < seatA + newState.seats.length; i++)
      {
        if (newState.seats[i % newState.seats.length].sleepless)
        {
          closest = i - seatA;
          break;
        }
      }
      for (let i = seatA - 1 + newState.seats.length; i > seatA; i--)
      {
        if (newState.seats[i % newState.seats.length].sleepless)
        {
          if (newState.seats.length + seatA - i < closest)
            closest = newState.seats.length + seatA - i;
          break;
        }
      }
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        let sleepless = 0;
        for (let i = 0; i < newState.seats.length; i++)
          sleepless += newState.seats[i]?.sleepless ? 1 : 0;
        closest = Math.floor(Math.random() * (newState.seats.length - 1 - sleepless) / 2) + 1;
      }
      // Niewyspane bydło udajace wycha poda poprawną informację 0
      if (newState.seats[seatA].sleepless && newState.seats[seatA].bydlo)
        closest = 0;
      newState.events.push({text: "Najbliższy niewyspany znajduje się w odległosci " + closest + ".", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Zły oboźny")
    {
      selectionA.forEach((s) => {
        if (!lie && (newState.seats[s].side === "astrolog" || (options.gorszyObozny && shouldGenerateFalseData(newState.seats[seatA]))))
        {
          newState.seats[s].removed = true;
          newState.events.push({text: newState.seats[s].username + " został wyrzucony z obozu.", visibility: "all"});
        }
        else
          newState.events.push({text: newState.seats[s].username + " nie został wyrzucony z obozu.", visibility: seatId});
      });
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Kwatermistrz")
    {
      let role = "Kwatermistrz";
      const neighbours = [
        newState.seats[(seatA + 1) % newState.seats.length].role,
        newState.seats[(seatA - 1 + newState.seats.length) % newState.seats.length].role,
      ];
      if (!lie || shouldGenerateFalseData(newState.seats[seatA]))
        role = neighbours[Math.floor(Math.random() * 2)];
      else
      {
        while (role === "Kwatermistrz" || neighbours.includes(role))
          role = newState.allRoles[Math.floor(Math.random() * newState.allRoles.length)].name;
      }
      newState.events.push({text: "Obok Ciebie znajduje się " + role + ".", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Mistrz obserwacji")
    {
      selectionA.forEach((s) => {
        if (!lie)
          newState.seats[s].sleepless = true;
        if (!lie || shouldGenerateFalseData(newState.seats[seatA]))
          newState.events.push({text: newState.seats[s].username + " to " + newState.seats[s].side + ".", visibility: seatId});
        else
          newState.events.push({text: newState.seats[s].username + " to " + (newState.seats[s].side === "astrolog" ? "astronom" : "astrolog") + ".", visibility: seatId});
      });
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Planmistrz")
    {
      let indexes = [...Array(newState.seats.length).keys()];
      const selectedSeats = [];
      let astrologs = 0;
      const sleepless = lie || shouldGenerateFalseData(newState.seats[seatA]);
      while (selectedSeats.length < 3 && indexes.length > 0)
      {
        const idx_id = Math.floor(Math.random() * indexes.length);
        const idx = indexes[idx_id];
        if (idx === seatA)
          continue;
        indexes.splice(idx_id, 1);
        const randSeat = newState.seats[idx];
        const isAstrolog = randSeat.side === "astrolog" ? 1 : 0;
        if (selectedSeats.length === 2 && (astrologs + isAstrolog === 1) === sleepless)
          continue;
        if (!sleepless && astrologs + isAstrolog > 1)
          continue;
        selectedSeats.push(randSeat);
        astrologs += isAstrolog;
      }
      const names = selectedSeats.reduce((text, s) => {return text + s.username + ", "}, "").slice(0, -2);
      newState.events.push({text: "Wśród " + names + " jest dokładnie 1 astrolog.", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Mistrz gry")
    {
      if (selectionA.length !== 3)
        return;
      let astrologs = 0;
      selectionA.forEach((s) => {
        astrologs += newState.seats[s].side === "astrolog" ? 1 : 0;
      });
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        let falseData = astrologs;
        while (falseData === astrologs)
          falseData = Math.floor(Math.random() * 3);
        astrologs = falseData;
      }
      newState.events.push({text: "Wśród wybranych osób jest " + astrologs + " astrologów.", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Dyżurny")
    {
      let closest = 0;
      if (newState.seats[seatA].side !== "astrolog")
      {
        for (let i = seatA + 1; i < seatA + newState.seats.length; i++)
        {
          if (newState.seats[i % newState.seats.length].side === "astrolog")
          {
            closest = i - seatA;
            break;
          }
        }
        for (let i = seatA - 1 + newState.seats.length; i > seatA; i--)
        {
          if (newState.seats[i % newState.seats.length].side === "astrolog")
          {
            if (newState.seats.length + seatA - i < closest)
              closest = newState.seats.length + seatA - i;
            break;
          }
        }
      }
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        let astrologs = 0;
        for (let i = 0; i < newState.seats.length; i++)
          astrologs += newState.seats[i]?.side === "astrolog" ? 1 : 0;
        let falseClosest = closest;
        while (falseClosest === closest)
          falseClosest = Math.floor(Math.random() * (newState.seats.length - 1 - astrologs) / 2) + 1;
        closest = falseClosest;
      }
      newState.events.push({text: "Najbliższy astrolog znajduje się w odległosci " + closest + ".", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Gitarzysta")
    {
      let astrologs = 0;
      astrologs += newState.seats[(seatA + 1) % newState.seats.length].side === "astrolog" ? 1 : 0;
      astrologs += newState.seats[(seatA - 1 + newState.seats.length) % newState.seats.length].side === "astrolog" ? 1 : 0;
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        let falseData = astrologs;
        while (falseData === astrologs)
          falseData = Math.floor(Math.random() * 3);
        astrologs = falseData;
      }
      newState.events.push({text: "Wokół Ciebie siedzi " + astrologs + " astrologów.", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Antyswatus")
    {
      let pairs = 0;
      let max = 0;
      for (let i = 0; i < newState.seats.length; i++)
      {
        if (newState.seats[i].side === "astrolog")
          max++;
        if (newState.seats[i].side === "astrolog" && newState.seats[(i + 1) % newState.seats.length].side === "astrolog")
          pairs++;
      }
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        let falseData = pairs;
        while (falseData === pairs)
          falseData = Math.floor(Math.random() * Math.max(2, max));
        pairs = falseData;
      }
      newState.events.push({text: "Na tym obozie jest " + pairs + " parek astrologów.", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Fizyk")
    {
      if (selectionA.length !== 1)
        return;
      newState.seats[selectionA[0]].removed = true;
      let result = checkWin(newState);
      newState.seats[selectionA[0]].removed = false;
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        const options = ["Astrologs", "Astronoms", "None"];
        let falseData = result;
        while (falseData === result)
          falseData = options[Math.floor(Math.random() * 3)];
        result = falseData;
      }
      if (result === "Astrologs")
        newState.events.push({text: "Wyrzucenie " + newState.seats[selectionA[0]].username + " spowoduje wygraną astrologów.", visibility: seatId});
      else if (result === "Astronoms")
        newState.events.push({text: "Wyrzucenie " + newState.seats[selectionA[0]].username + " spowoduje wygraną astronomów.", visibility: seatId});
      else
        newState.events.push({text: "Wyrzucenie " + newState.seats[selectionA[0]].username + " nie spowoduje końca gry.", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Chemik")
    {
      if (selectionA.length !== 2)
        return;
      let detected = false;
      selectionA.forEach((s) => {
        if (newState.seats[s].side === "astrolog")
        {
          detected = true;
          return;
        }
      });
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
        detected = !detected;
      if (detected)
        newState.events.push({text: "Wśród " + newState.seats[selectionA[0]].username + " i " + newState.seats[selectionA[1]].username + " wykryto astrologa.", visibility: seatId});
      else  
        newState.events.push({text: "Wśród " + newState.seats[selectionA[0]].username + " i " + newState.seats[selectionA[1]].username + " nie wykryto astrologa.", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Ekonomista")
    {
      const reach = Math.floor((newState.seats.length - 1) / 2);
      let right = 0;
      let left = 0;
      for (let i = seatA + 1; i < seatA + 1 + reach; i++)
      {
        if (newState.seats[i].side === "astrolog")
          right++;
      }
      for (let i = seatA - 1 + newState.seats.length; i > seatA - 1 + newState.seats.length - reach; i--)
      {
        if (newState.seats[i].side === "astrolog")
          left++;
      }
      let result = right === left ? 0 : (right > left ? 1 : 2);
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        if (newState.astrologsCount % 2 === 1 && newState.seats.length % 2 === 1)
          result = 3 - result;
        else
        {
          let falseData = result;
          while (falseData === result)
            falseData = Math.floor(Math.random() * 3);
          result = falseData;
        }
      }
      if (result === 0)
        newState.events.push({text: "Po prawej i lewej jest tyle samo astrologów.", visibility: seatId});
      else if (result === 1)
        newState.events.push({text: "Więcej astrologów znajduje się po prawej stronie.", visibility: seatId});
      else
        newState.events.push({text: "Więcej astrologów znajduje się po lewej stronie.", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
    else if (roleA === "Astronom sferyczny")
    {
      const reach = Math.floor((newState.seats.length - 1) / 2);
      let right = 0;
      let left = 0;
      for (let i = seatA + 1; i < seatA + 1 + reach; i++)
      {
        if (newState.seats[i % newState.seats.length].side === "astrolog")
        {
          right = i - seatA;
          break;
        }
      }
      for (let i = seatA - 1 + newState.seats.length; i > seatA - 1 + newState.seats.length - reach; i--)
      {
        if (newState.seats[i % newState.seats.length].side === "astrolog")
        {
          left = seatA + newState.seats.length - i;
          break;
        }
      }
      let result = right === left ? 0 : (right > left ? 1 : 2);
      if (lie || shouldGenerateFalseData(newState.seats[seatA]))
      {
        if (newState.astrologsCount === 1 && newState.seats.length % 2 === 1)
          result = 3 - result;
        else
        {
          let falseData = result;
          while (falseData === result)
            falseData = Math.floor(Math.random() * 3);
          result = falseData;
        }
      }
      if (result === 0)
        newState.events.push({text: "Astrolodzy po prawej i lewej są tak samo blisko.", visibility: seatId});
      else if (result === 1)
        newState.events.push({text: "Najbliższy astrolog znajduje się po lewej stronie.", visibility: seatId});
      else
        newState.events.push({text: "Najbliższy astrolog znajduje się po prawej stronie.", visibility: seatId});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seatA].usedUp = true;
      setGameState(newState);
    }
  }

  const komendantRoles = gameState.seats.filter(s => s.side === "astronom" && s.role !== "Komendant")
    .reduce((roles, s) => {if (!roles.includes(s.role)) roles.push(s.role); return roles;}, []);

  return (
    <>
      {myAction && <div className="gameActionContainer">
        <span>{actionText}</span>
        {role === "Komendant" && <select defaultValue={null} onChange={(e) => setKomendantOption(e.target.value)}>
          <option key={0}></option>
          {komendantRoles.map(r => <option key={r}>{r}</option>)}
        </select>}
        {confirmButtonVisible && <button className="gameButton" onClick={() => activateAction([], role, seat)}>Potwierdź</button>}
      </div>}
      <div className="gameBoardGrid">
        {seats.map((s, idx) => <div key={idx}>{s ? <div className="gameSeat">
          <div className="gameSeatNameContainer">
            {votes && s.id in votes && <div className={votes[s.id] ? "gameVoteTrue" : "gameVoteFalse"}></div>}
            <div className={s.removed ? "gameSeatNameRemoved" : "gameSeatName"}>{createPlayerText(s)}</div>
          </div>
          {/* {s.sleepless && <div>Niewyspany</div>} */}
          <div>
            {!isNight && !isUser && !isDev && !isVoting && s.id !== me.id && !s.removed && <button className="gameButton" onClick={(e) => startVoting(e, s.id)}>Oskarż</button>}
            {!isDev && myAction && !isVoting && canBeSelected.includes(s.seatId) && !s.removed && <button className={isSelected.includes(s.seatId) ? "gameActionSelectionTrue" : "gameActionSelectionFalse"} onClick={() => actionTargetSelected(s.seatId)}>Wybierz</button>}
          </div>
          <textarea className="gameTextArea"></textarea>
        </div> : 
        null}</div>)}
      </div>
    </>
  )
}
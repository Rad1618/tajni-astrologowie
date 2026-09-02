import { useState, useEffect } from 'react';
import '../styles/game.css';

export default function GameBoard({gameState, setGameState, seat, me, checkWin}) {
  const [seats, setSeats] = useState([]);
  const [canBeSelected, setCanBeSelected] = useState([]);
  const [isSelected, setIsSelected] = useState([]);
  const [actionText, setActionText] = useState("");
  const [confirmButtonVisible, setConfirmButtonVisible] = useState(false);
  const [komendantOption, setKomendantOption] = useState(null);
  const [komendantRole, setKomendantRole] = useState(null);

  const isNight = gameState.orders.length > 0;
  const isUser = seat < 0;
  const isAdmin = me?.admin;
  const mySeat = isUser || gameState.seats.length <= seat ? {} : gameState.seats[seat];
  const myAction = !mySeat?.usedUp && ((isNight && gameState.orders[0] === mySeat?.order) || (!isNight && mySeat?.order < 0)) || null;
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
    let text = seat.username;
    let additionalSymbols = "";
    if (isAdmin)
    {
      if (seat.sleepless)
        additionalSymbols += "💤";
      if (seat.bydlo)
        additionalSymbols += "🐂";
      if (seat.usedUp)
        additionalSymbols += "🏁";
    }
    if (isAdmin || seat.id === me.id || (seat?.removed && !hideRemoved) || seat?.visible)
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
      voting: {active: true, finalised: false, target: target}
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
  }, [myAction, role])

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
    activateAction(newSelection);
  }

  function activateAction(newSelection)
  {
    if (!myAction || (newSelection.length === 0 && !confirmButtonVisible))
      return;
    const newState = {...gameState};
    if (role === "Astrolog" || role === "Astrolog biurokratyczny")
    {
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      setGameState(newState);
    }
    else if (role === "Astrolog medyczny")
    {
      if (newSelection.length !== 1)
        return;
      newState.seats[newSelection[0]].sleepless = true;
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.events.push({text: newState.seats[newSelection[0]].username + " jest niewyspany.", visibility: "astrolodzy"});
      setGameState(newState);
    }
    else if (role === "Astrolog holistyczny")
    { 
      for (let i = seat + 1; i < seat + newState.seats.length; i++)
      {
        if (newState.seats[i % newState.seats.length].side !== "astrolog")
        {
          newState.seats[i % newState.seats.length].sleepless = true;
          newState.events.push({text: newState.seats[i % newState.seats.length].username + " jest niewyspany.", visibility: "astrolodzy"});
          break;
        }
      }
      for (let i = seat - 1 + newState.seats.length; i > seat; i--)
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
    else if (role === "Manipulator")
    {
      if (newSelection.length !== 1)
        return;
      newState.seats[newSelection[0]].side = "astrolog";
      newState.seats[newSelection[0]].manipulated = true;
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.events.push({text: newState.seats[newSelection[0]].username + " jest od teraz astrologiem.", visibility: "astrolodzy"});
      newState.events.push({text: "Zostałeś astrologiem. Od teraz wygrywasz z astrologami.", visibility: newState.seats[newSelection[0]].id});
      setGameState(newState);
    }
    else if (role === "Komendant")
    {
      if (komendantOption)
        setKomendantRole(komendantOption);
    }
    else if (role === "Dinozaur")
    {
      newState.seats[seat].visible = true;
      newState.seats[seat].usedUp = true;
      newState.events.push({text: newState.seats[seat].username + " ujawnia się, jako " + mySeat.role, visibility: "all"});
      setGameState(newState);
    }
    else if (role === "Mini-Medyk")
    {
      let count = 0;
      if (newState.seats[(seat + 1) % newState.seats.length].sleepless)
        count++;
      if (newState.seats[(seat - 1 + newState.seats.length) % newState.seats.length].sleepless)
        count++;
      if (shouldGenerateFalseData(newState.seats[seat]))
      {
        let newCount = count;
        while (newCount === count)
          newCount = Math.floor(Math.random() * 3);
        count = newCount;
      }
      newState.seats[(seat + 1) % newState.seats.length].sleepless = false;
      newState.seats[(seat - 1 + newState.seats.length) % newState.seats.length].sleepless = false;
      newState.events.push({text: "Uleczyłeś " + count + " osób.", visibility: mySeat.id})
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Wych")
    {
      let closest = -1;
      for (let i = seat + 1; i < seat + newState.seats.length; i++)
      {
        if (newState.seats[i % newState.seats.length].sleepless)
        {
          closest = i - seat;
          break;
        }
      }
      for (let i = seat - 1 + newState.seats.length; i > seat; i--)
      {
        if (newState.seats[i % newState.seats.length].sleepless)
        {
          if (newState.seats.length + seat - i < closest)
            closest = newState.seats.length + seat - i;
          break;
        }
      }
      if (shouldGenerateFalseData(newState.seats[seat]))
      {
        let sleepless = 0;
        for (let i = 0; i < newState.seats.length; i++)
          sleepless += newState.seats[i]?.sleepless ? 1 : 0;
        closest = Math.floor(Math.random() * (newState.seats.length - 1 - sleepless) / 2) + 1;
      }
      // Niewyspane bydło udajace wycha poda poprawną informację 0
      if (newState.seats[seat].sleepless && newState.seats[seat].bydlo)
        closest = 0;
      newState.events.push({text: "Najbliższy niewyspany znajduje się w odległosci " + closest + ".", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Zły oboźny")
    {
      newSelection.forEach((s) => {
        if (newState.seats[s].side === "astrolog")
        {
          newState.seats[s].removed = true;
          newState.events.push({text: newState.seats[s].username + " został wyrzucony z obozu.", visibility: "all"});
        }
        else
          newState.events.push({text: newState.seats[s].username + " nie został wyrzucony z obozu.", visibility: "all"});
      });
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Kwatermistrz")
    {
      let role = "Kwatermistrz";
      const neighbours = [
        newState.seats[(seat + 1) % newState.seats.length].role,
        newState.seats[(seat - 1 + newState.seats.length) % newState.seats.length].role,
      ];
      if (!shouldGenerateFalseData(newState.seats[seat]))
        role = neighbours[Math.floor(Math.random() * 2)];
      else
      {
        while (role === "Kwatermistrz" || neighbours.includes(role))
          role = newState.allRoles[Math.floor(Math.random() * newState.allRoles.length)].name;
      }
      newState.events.push({text: "Obok Ciebie znajduje się " + role + ".", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Mistrz obserwacji")
    {
      newSelection.forEach((s) => {
        newState.seats[s].sleepless = true;
        if (!shouldGenerateFalseData(newState.seats[seat]))
          newState.events.push({text: newState.seats[s].username + " to " + newState.seats[s].side + ".", visibility: mySeat.id});
        else
          newState.events.push({text: newState.seats[s].username + " to " + (newState.seats[s].side === "astrolog" ? "astronom" : "astrolog") + ".", visibility: mySeat.id});
      });
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Planmistrz")
    {
      let indexes = [...Array(newState.seats.length).keys()];
      const selectedSeats = [];
      let astrologs = 0;
      const sleepless = shouldGenerateFalseData(newState.seats[seat]);
      while (selectedSeats.length < 3 && indexes.length > 0)
      {
        const idx_id = Math.floor(Math.random() * indexes.length);
        const idx = indexes[idx_id];
        if (idx === seat)
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
      newState.events.push({text: "Wśród " + names + " jest dokładnie 1 astrolog.", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Mistrz gry")
    {
      if (newSelection.length !== 3)
        return;
      let astrologs = 0;
      newSelection.forEach((s) => {
        astrologs += newState.seats[s].side === "astrolog" ? 1 : 0;
      });
      if (shouldGenerateFalseData(newState.seats[seat]))
      {
        let falseData = astrologs;
        while (falseData === astrologs)
          falseData = Math.floor(Math.random() * 3);
        astrologs = falseData;
      }
      newState.events.push({text: "Wśród wybranych osób jest " + astrologs + " astrologów.", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Dyżurny")
    {
      let closest = 0;
      if (newState.seats[seat].side !== "astrolog")
      {
        for (let i = seat + 1; i < seat + newState.seats.length; i++)
        {
          if (newState.seats[i % newState.seats.length].side === "astrolog")
          {
            closest = i - seat;
            break;
          }
        }
        for (let i = seat - 1 + newState.seats.length; i > seat; i--)
        {
          if (newState.seats[i % newState.seats.length].side === "astrolog")
          {
            if (newState.seats.length + seat - i < closest)
              closest = newState.seats.length + seat - i;
            break;
          }
        }
      }
      if (shouldGenerateFalseData(newState.seats[seat]))
      {
        let astrologs = 0;
        for (let i = 0; i < newState.seats.length; i++)
          astrologs += newState.seats[i]?.side === "astrolog" ? 1 : 0;
        let falseClosest = closest;
        while (falseClosest === closest)
          falseClosest = Math.floor(Math.random() * (newState.seats.length - 1 - astrologs) / 2) + 1;
        closest = falseClosest;
      }
      newState.events.push({text: "Najbliższy astrolog znajduje się w odległosci " + closest + ".", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Gitarzysta")
    {
      let astrologs = 0;
      astrologs += newState.seats[(seat + 1) % newState.seats.length].side === "astrolog" ? 1 : 0;
      astrologs += newState.seats[(seat - 1 + newState.seats.length) % newState.seats.length].side === "astrolog" ? 1 : 0;
      if (shouldGenerateFalseData(newState.seats[seat]))
      {
        let falseData = astrologs;
        while (falseData === astrologs)
          falseData = Math.floor(Math.random() * 3);
        astrologs = falseData;
      }
      newState.events.push({text: "Wokół Ciebie siedzi " + astrologs + " astrologów.", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Antyswatus")
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
      if (shouldGenerateFalseData(newState.seats[seat]))
      {
        let falseData = pairs;
        while (falseData === pairs)
          falseData = Math.floor(Math.random() * Math.max(2, max));
        pairs = falseData;
      }
      newState.events.push({text: "Na tym obozie jest " + pairs + " parek astrologów.", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Fizyk")
    {
      if (newSelection.length !== 1)
        return;
      newState.seats[newSelection[0]].removed = true;
      let result = checkWin(newState);
      newState.seats[newSelection[0]].removed = false;
      if (shouldGenerateFalseData(newState.seats[seat]))
      {
        const options = ["Astrologs", "Astronoms", "None"];
        let falseData = result;
        while (falseData === result)
          falseData = options[Math.floor(Math.random() * 3)];
        result = falseData;
      }
      if (result === "Astrologs")
        newState.events.push({text: "Wyrzucenie " + newState.seats[newSelection[0]].username + " spowoduje wygraną astrologów.", visibility: mySeat.id});
      else if (result === "Astronoms")
        newState.events.push({text: "Wyrzucenie " + newState.seats[newSelection[0]].username + " spowoduje wygraną astronomów.", visibility: mySeat.id});
      else
        newState.events.push({text: "Wyrzucenie " + newState.seats[newSelection[0]].username + " nie spowoduje końca gry.", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Chemik")
    {
      if (newSelection.length !== 2)
        return;
      let detected = false;
      newSelection.forEach((s) => {
        if (newState.seats[s].side === "astrolog")
        {
          detected = true;
          return;
        }
      });
      if (shouldGenerateFalseData(newState.seats[seat]))
        detected = !detected;
      if (detected)
        newState.events.push({text: "Wśród " + newState.seats[newSelection[0]].username + " i " + newState.seats[newSelection[1]].username + " wykryto astrologa.", visibility: mySeat.id});
      else  
        newState.events.push({text: "Wśród " + newState.seats[newSelection[0]].username + " i " + newState.seats[newSelection[1]].username + " nie wykryto astrologa.", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Ekonomista")
    {
      const reach = Math.floor((newState.seats.length - 1) / 2);
      let right = 0;
      let left = 0;
      for (let i = seat + 1; i < seat + 1 + reach; i++)
      {
        if (newState.seats[i].side === "astrolog")
          right++;
      }
      for (let i = seat - 1 + newState.seats.length; i > seat - 1 + newState.seats.length - reach; i--)
      {
        if (newState.seats[i].side === "astrolog")
          left++;
      }
      let result = right === left ? 0 : (right > left ? 1 : 2);
      if (shouldGenerateFalseData(newState.seats[seat]))
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
        newState.events.push({text: "Po prawej i lewej jest tyle samo astrologów.", visibility: mySeat.id});
      else if (result === 1)
        newState.events.push({text: "Więcej astrologów znajduje się po prawej stronie.", visibility: mySeat.id});
      else
        newState.events.push({text: "Więcej astrologów znajduje się po lewej stronie.", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
      setGameState(newState);
    }
    else if (role === "Astronom sferyczny")
    {
      const reach = Math.floor((newState.seats.length - 1) / 2);
      let right = 0;
      let left = 0;
      for (let i = seat + 1; i < seat + 1 + reach; i++)
      {
        if (newState.seats[i % newState.seats.length].side === "astrolog")
        {
          right = i - seat;
          break;
        }
      }
      for (let i = seat - 1 + newState.seats.length; i > seat - 1 + newState.seats.length - reach; i--)
      {
        if (newState.seats[i % newState.seats.length].side === "astrolog")
        {
          left = seat + newState.seats.length - i;
          break;
        }
      }
      let result = right === left ? 0 : (right > left ? 1 : 2);
      if (shouldGenerateFalseData(newState.seats[seat]))
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
        newState.events.push({text: "Astrolodzy po prawej i lewej są tak samo blisko.", visibility: mySeat.id});
      else if (result === 1)
        newState.events.push({text: "Najbliższy astrolog znajduje się po lewej stronie.", visibility: mySeat.id});
      else
        newState.events.push({text: "Najbliższy astrolog znajduje się po prawej stronie.", visibility: mySeat.id});
      if (newState.orders.length > 0)
        newState.orders.splice(0, 1);
      newState.seats[seat].usedUp = true;
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
        {confirmButtonVisible && <button className="gameButton" onClick={() => activateAction([])}>Potwierdź</button>}
      </div>}
      <div className="gameBoardGrid">
        {seats.map((s, idx) => <div key={idx}>{s ? <div className="gameSeat">
          <div className="gameSeatNameContainer">
            {votes && s.id in votes && <div className={votes[s.id] ? "gameVoteTrue" : "gameVoteFalse"}></div>}
            <div className={s.removed ? "gameSeatNameRemoved" : "gameSeatName"}>{createPlayerText(s)}</div>
          </div>
          {/* {s.sleepless && <div>Niewyspany</div>} */}
          <div>
            {!isNight && !isUser && !isAdmin && s.id !== me.id && !s.removed && <button className="gameButton" onClick={(e) => startVoting(e, s.id)}>Oskarż</button>}
            {!isAdmin && myAction && canBeSelected.includes(s.seatId) && !s.removed && <button className={isSelected.includes(s.seatId) ? "gameActionSelectionTrue" : "gameActionSelectionFalse"} onClick={() => actionTargetSelected(s.seatId)}>Wybierz</button>}
          </div>
          <textarea className="gameTextArea"></textarea>
        </div> : 
        null}</div>)}
      </div>
    </>
  )
}
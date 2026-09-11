import { useState, useMemo } from 'react';
import { Rat } from 'lucide-react'
import '../styles/modals.css';

export default function HelpMeModal({open, setOpen, gameState})
{
  const [page, setPage] = useState("hello");

  const uniqueRoles = useMemo(() => {
    if (!gameState || !gameState?.allRoles)
      return [];
    const uniqueNames = [];
    const unique = [];
    gameState.allRoles.forEach((role) => {
      if (!uniqueNames.includes(role.name))
      {
        uniqueNames.push(role.name);
        unique.push(role);
      }
    });
    return unique;
  }, [gameState])

  if (!open)
    return null;

  return (<div className="modalOverlay">
      <div className="modalPanel wide">
        <div className="modalHeader">Specjalne Okienko Reedukacji</div>
          {page === "hello" && <div>
            <p>
              Witaj w specjalnym okienku reedukacji. W tym miejscu możesz dowiedzieć się
              wszystkiego o Tajnych Astrologach (wszystko obejmuje jedynie te rzeczy,
              które zostały już zaimplementowane).
            </p>
            <p>
              Wybierz jeden z tematów poniżej, aby otrzymać pomoc.
            </p>
            <button disabled={!gameState} className='sorOptionButton' onClick={() => setPage("game-roles")}>Jakie są role w obecnej grze?</button>
            <button className='sorOptionButton' onClick={() => setPage("credits")}>Kto jest za to odpowiedzialny?</button>
            <hr></hr>
          </div>}
          {page === "game-roles" && <div>
            <table className='modalTable'>
              <thead>
                <tr>
                  <th>Rola</th>
                  <th>Liczba</th>
                  <th>Opis</th>
                </tr>
              </thead>
              <tbody>
                {uniqueRoles.map((role) => {
                  return (<tr key={role.name}>
                    <td className={role.side === "astrolog" ? "redText" : ""}>{role.name}</td>
                    <td>{gameState.allRoles.filter((r) => r.name === role.name).length}</td>
                    <td>{role.desc}</td>
                  </tr>)
                })}
              </tbody>
            </table>
          </div>}
          {page === "credits" && <div>
            <p><strong>Główny Sprawca</strong><br/>Rad1618</p>
            <p><strong>Oryginalny Spiskowiec</strong><br/>Mac15001900</p>
            <p><strong>Rad Queen</strong><br/>Malga01</p>
            <p><strong>Deratyzatorzy</strong><br/>
              <Rat/><Rat/><Rat/>
            </p>
          </div>}
        {page !== "hello" && <button className='marginBottom' onClick={() => setPage("hello")}>Wracam na korytarz</button>}
        <button onClick={() => {setPage("hello"); setOpen(false);}}>Wracam na obóz</button>
      </div>
    </div>);
}
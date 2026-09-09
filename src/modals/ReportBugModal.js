import { useState } from "react";

export default function ReportBugModal({open, setOpen})
{
  const [prank, setPrank] = useState(false);

  if (!open)
    return null;

  return (
    <div className="modalOverlay">
      <div className="modalPanel">
        <div className="modalHeader">Zgłaszanie błędów</div>
        <p className="modalText">
          Znalazłeś błąd w grze? Ale super!
          Pewnie jesteś z sebie dumny?
          Ja też jestem z Ciebie dumny i chciałbym Ci pogratulować.
          Znajdź mnie na Almuserwerze na discordzie i napisz do mnie wiadomość.
          Pamiętaj, aby opisać błąd jak najbardziej szczegółowo.
          Jeżeli nie będę umieć go zreplikować, to się nie liczy.
          W ramach nagrody za znalezienie błędu zostaniesz umieszczony
          w creditsach, jako <strong>Deratyzator</strong>.
          Ale nagroda jest tylko jedna na bug, więc kto pierwszy ten lepszy.
          Nie jesteś na Almuserwerze? Jeśli tak, to skąd znasz tę aplikację?
          Najlepiej skontaktuj się z osobą, która Ci to pokazała.
        </p>
        <button className={prank ? "goToTheLeft" : ""} onClick={() => {
          if (prank)
            setOpen(false)
          setPrank(!prank);
        }}>Ok</button>
      </div>
    </div>
  );
}
# Tajni Astrologowie

Elektroniczna wersja gry Tajni Astrologowie, zaprojektowanej przez Mac15001900.

Gracze wcielają się w kadrę obozu astronomicznego, który został zinfiltrowany przez astrologów
przybyłych z równoległego wymiaru. Gra toczy się podczas zbiórki kadry, podczas której, astronomowie
muszą zidentyfikować astrologów i wyrzucić ich z obozu.

## Mechaniki

Każdemu graczowi zostanie losowo przypisana rola, role są niewidoczne dla innych graczy. Wyjątek stanowią
astrologowie, którzy znają się nawzajem. Każda rola ma unikalną zdolność, która pozwala na uzyskanie
informacji, lub wpłynięcie na innych graczy. Wszyscy gracze siedzą w kółku.

Gra ma 2 fazy:
Faza nocy: podczas tej fazy poznają się astrologowie, a część ról wykonuje swoje akcje. Podczas tej fazy
dyskusje i głosowania są zakazane.
Faza dnia: podczas tej fazy odbywają się wszystkie dyskusje. Można również głosować nad wyrzuceniem osoby
z obozu. Aby to zrobić, jedna osoba musi oskarżyć podejrzanego, a następnie większość musi zagłosować za jego
wyrzuceniem. Część ról może użyć swojej zdolności w dowolnej chwili dnia. Faza dnia jest ograniczona czasowo.

Astronomowie wygrywają, jeśli wyrzucą z obozu wszystkich astrologów, zanim wygrają astrologowie.
Astrologowie mogą wygrać na kilka sposobów:
1. Wyrzucenie drugiego astronoma
2. Uzyskanie takiej samej liczby astrologów i astronomów
3. Upłynięcie czasu gry

Niektóre role mogą sprawić, że dany gracz stanie się niewyspany. Niewyspana osoba nie wie, że jest niewyspana.
Niewyspany gracz otrzyma zawsze fałszywe informacje, gry użyje swojej roli. Zdolności, które nie polegają na
zdobywaniu informacji (np. leczenie, czy ujawnianie się) pozostają bez zmian.

## Rozpoczęcie gry

Po włączeniu strony, należy podać swoje imię oraz nazwę pokoju, którą należy ustalić z innymi uczestnikami gry.

Następnie trafia się do Lobby, gdzie można wybrać, jakie role mają się pojawić w grze, a także zmienić
inne ustawienia gry. Wystarczy, aby jedna osoba wybrała role i kliknęła "Start".

Po uruchomieniu gry, wszyscy trafią do ekranu gry. Pozycja grającego będzie zawsze na dole. W zależności
od fazy gry i roli gracza, ekran będzie wyświetlać inne informacje i możliwości.

## UI

Na górze ekranu znajdują się najważniejsze informacje: rola i strona gracza, oraz zegar.
Na górze znajduje się również przypomnienie roli i możliwość jej aktywacji, jeśli jest to możliwe.

Na środku znajduje się rozkład graczy w kółku (kółko jest zawsze zamknięte, nawet, jeśli brakuje gracza u góry).
Każdy gracz ma przypisane pole, w którym można prowadzić prywatne notatki na temat danego gracza. Jeżeli ze
względu na porę dnia i rolę, możliwe jest wybranie gracz (lub graczy) w jakimś celu, pokażą się odpowiednie przyciski.

Na dole ekranu znajdują się dwie tablice:
Po lewej: tablica ogłoszeń, zawiera najważniejsze informacje z przebiegu gry. Tu również zostaną podane
informacje zdobyte poprzez użycie roli. Niektóre wiadomości mają ograniczoną widoczność.
Po prawej: astroLOG codzinny, tablica widoczna jedynie dla astrologów, służąca do komunikacji. Każdy astrolog
w ciągu całej gry, może wysłać do 3 wiadomości (każda mająca maksymalnie 20 znaków).

## Boty

Istnieje możliwość gry z botami. Boty są jednak wciąż w fazie testów, dlatego mogą powodować
bugi i nie działać najlepiej, w niektórych sytuacjach. Podczas gry z botami, co najmniej jeden człowiek ZAWSZE będzie astronomem.

W szczególności nie powinno się grać z rolami "Komendant" i "Zły oboźny", jeśli w grze są boty. "Bydło" i "Manipulator" również nie zostali jeszcze przetestowani, a potencjalnie mogą tworzyć problemy. Grając z botami, w grze musi być co najmniej jedna rola astronoma inna niż Dinozaur. W przeciwnym wypadku może dojść do zawieszenia strony.

Boty wykonują swoje akcje automatycznie na początku gry i dzielą się zdobytymi informacjami na tablicy ogłoszeń (w losowej kolejności). Boty astrolodzy udają losową rolę astronoma (inną niż Dinozaur). Boty astrolodzy ZAWSZE kłamią (działają tak, jakby rola, za którą się podają była niewyspana).

Podczas głosowania, każdy bot głosuje, jak losowy człowiek w ich frakcji. Jeśli frakcja astrologów nie ma człowieka, boty głosują, jak losowy człowiek astronom.

## Zabronione strategie

Zabronione są wszelkie strategie dedukcji, które wymagają znajomości kodu programu, lub wiedzy zewnętrznej. Dotyczy to między innymi:

1. Prób weryfikacji czyjejś roli na podstawie tego, czy umie zacytować precyzyjnie swoją wiadomość.
2. Dedukcji stron botów na podstawie manipulacji przy pomocy głosowania.

W związku z punktem 1. nie zaleca się również cytowania swoich wiadomości otrzymanych w związku z aktywacją roli.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

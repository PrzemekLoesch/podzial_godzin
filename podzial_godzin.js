class CMenadzerPodzialuGodzin {
    constructor() {
        
        // włącz eventy
        this.przypiszZdarzenia();

        // resetuj dane
        this.resetujDane();
    }

    przypiszZdarzenia() {

        // przyciski dodania uczniów, przedmiotów, nauczycieli i lokalizacji
        Array.from(document.querySelectorAll('button[id^="dodaj_"]')).forEach(button => button.addEventListener('click', (e) => this.otworzOkno(e.target.id.split('_')[1])));

        // plansza z rozkładem zajęć i jej eventy
        var kalendarz = document.querySelector('.widok-tygodnia');
        kalendarz.addEventListener('click', e => this.obsluzKliniecie(e));
        kalendarz.addEventListener('mousedown', e => this.obsluzMouseDown(e));

        // zapis pliku danych
        document.getElementById('pobierz_dane').addEventListener('click', () => this.pobierzPlikDanych());

        // odczyt danych z pliku
        document.getElementById('wczytaj_dane').addEventListener('click', () => document.getElementById('zrodlo_danych').click());

        // wczytanie plku
        document.getElementById('zrodlo_danych').addEventListener('change', (e) => this.wczytajPlikDanych(e.target.files[0]));

        this.stan_kursora = {};
    }

    resetujDane() {

        // pojemniki na dane
        this.uczniowie = [];
        this.przedmioty = [];
        this.nauczyciele = [];
        this.lokalizacje = [];
        this.zajecia = [];

        // usunięcie wszytkich bloków zajęć z widoku kalendarza
        Array.from(document.querySelectorAll('div[id^="blok_zajec_"]')).forEach(element => element.remove());
    }   

    otworzOkno(nazwa_danych, id) {
        var okno = new COknoModalne(this, nazwa_danych, id, this[nazwa_danych][id]);
    }

    otworzOknoZajec(id, dzien, poczatek, koniec) {

        // jeśli to edycja istniejących zajęć - przypisz dane z obiektu
        if (id !== undefined) var dane = this.zajecia[id];
        
        // jeśli nowe zajęcia - ustaw wartości, które są znane
        else var dane = {
            uczen: null,
            przedmiot: null,
            dzien: dzien,
            poczatek: poczatek,
            koniec: koniec
        };

        console.log('Dane: ', dane);

        var okno = new COknoModalne(this, 'zajecia', id, dane, {przedmiot: this.przedmioty, uczen: this.uczniowie});
    }

    zapiszDaneFormularza(nazwa_danych, id, dane) {

        if (nazwa_danych == 'zajecia') {
            this.zapiszZajecia(id, dane);
            return;
        }

        // edycja istniejącego rekordu
        if (id !== undefined) {
            // aktualizacja danych
            this[nazwa_danych][id] = dane;
            
            // aktualizacja etykiety
            document.querySelector(`#${nazwa_danych}_${id}`).innerHTML = dane.nazwa;
        }

        // dodanie nowego rekordu
        else {
            // dodaj rekord do list
            var id = this[nazwa_danych].push(dane) - 1;

            // dodaj pozycję listy
            var wpis = document.querySelector("#wpis").content.cloneNode(true);
            var div = wpis.querySelector('div');
            div.innerHTML = dane.nazwa;
            div.id = `${nazwa_danych}_${id}`;
            wpis.querySelector('button').addEventListener('click', () => this.otworzOkno(nazwa_danych, id));
            document.querySelector(`#lista_${nazwa_danych}`).appendChild(wpis);
        }
    }

    zapiszZajecia(id, dane) {

        // edycjas istniejących zajęć
        if (id) {
            var zajecia = document.getElementById(`blok_zajec_${id}`);
            var gora = this.czasNaPozycje(dane.poczatek);
            var wysokosc = this.czasNaPozycje(dane.koniec) - gora;
            zajecia.style.top = gora + 'px';
            zajecia.style.height = wysokosc + 'px';
            zajecia.innerHTML = this.przedmioty[dane.przedmiot].nazwa;
        }

        // dodanie nowych zajęć
        else {
            id = this.zajecia.push(dane) - 1;
            var zajecia = document.createElement('div');
            var gora = this.czasNaPozycje(dane.poczatek);
            var wysokosc = this.czasNaPozycje(dane.koniec) - gora;
            zajecia.className = 'blok-zajec';
            zajecia.style.top = gora + 'px';
            zajecia.style.height = wysokosc + 'px';
            zajecia.innerHTML = this.przedmioty[dane.przedmiot].nazwa;
            zajecia.id = `blok_zajec_${id}`;
            document.querySelectorAll('.plan-dnia')[dane.dzien].appendChild(zajecia);
        }
    }

    async pobierzPlikDanych() {

        // blob z danymi
        var blob = new Blob([JSON.stringify({
            uczniowie: this.uczniowie,
            przedmioty: this.przedmioty,
            nauczyciele: this.nauczyciele,
            lokalizacje: this.lokalizacje,
            zajecia: this.zajecia
        })], { type: 'text/plain' });
        
        // url
        var blobURL = URL.createObjectURL(blob);
        
        // element a
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = 'podzial_godzin.json';
        a.style.display = 'none';
        document.body.append(a);
        
        // wywołaj event click - powoduje pobranie elementu
        a.click();
        
        // usuń blob
        setTimeout(() => {
            URL.revokeObjectURL(blobURL);
            a.remove();
        }, 1000);
    };

    // otwiera wybrany plik
    wczytajPlikDanych(plik) {
        
        if (plik) {
            var reader = new FileReader();
            reader.onload = (e) => this.odtworzWidokzDanych(JSON.parse(e.target.result));
            reader.onerror = (e) => alert('Błąd odczytu pliku');
            reader.readAsText(plik, "UTF-8");
        }
    }

    // odbudowuje interfejs - wypełnia dnymi z wybranego pliku
    odtworzWidokzDanych(dane) {
        
        // wyczyść obiekty, listy i wodok kalendarza
        this.resetujDane();
        
        Object.keys(dane).forEach(nazwa_danych => {
            if (nazwa_danych == 'zajecia') {
                dane.zajecia.forEach(zajecia => this.zapiszZajecia(undefined, zajecia));
            }

            else {
                document.getElementById(`lista_${nazwa_danych}`).innerHTML = '';
                dane[nazwa_danych].forEach(rekord => this.zapiszDaneFormularza(nazwa_danych, undefined, rekord));
            }
        });
    }

    // odczytuje wartość wybranej opcji z widgetu select
    wartoscSelect(select) {
        var index = select.selectedIndex;
        return index != -1 ? select.options[index].value : undefined;
    }

    
    // rozpoczyna edycję elementu kalendarza
    obsluzKliniecie(e) {

        // jeśli rozpocząto tryb przeciągania i rzeczywiście przeciągnięto ne rób nic - metoda obsluzMouseUp zajmie się dodaniem zajęć
        if (this.stan_kursora.przeciagnieto) return;

        // edycja istniejących zajęć
        if (e.target.classList.contains('blok-zajec')) this.otworzOknoZajec(e.target.id.split('_')[2]);

        // dodanie zajęć
        else if (e.target.classList.contains('plan-dnia')) {
            var rect = e.target.getBoundingClientRect();
            var poczatek = e.clientY - rect.top;
            this.otworzOknoZajec(null, e.target.getAttribute('num'), this.pozycjaNaCzas(poczatek), null);
        }

        // zeruj stan kursora
        this.stan_kursora = {};
    }

    obsluzMouseDown(e) {

        console.log('mousedown');
       
        // od tego mmntu adresuj wszystkie eventy dotyczące ruchu myszy do tej klasy
        document.onmouseup = e => this.obsluzMouseUp(e);
        document.onmousemove = e => this.obsluzMouseMove(e);

        // zarejestruj dane naciśnietego elementu
        this.stan_kursora.element = e.target;
        this.stan_kursora.poczatek_przeciagania = e.clientY;
        this.stan_kursora.przeciagnieto = false;
        if (this.stan_kursora.element.classList.contains('blok-zajec')) {
            this.stan_kursora.pozycja_poczatkowa_zajec = parseInt(e.target.style.top.slice(0,-2));
        }
        if (e.target.classList.contains('uchwyt-gorny') || e.target.classList.contains('uchwyt-dolny')) {
            this.stan_kursora.pozycja_poczatkowa_zajec = parseInt(e.target.parentNode.style.top.slice(0,-2));
            this.stan_kursora.wysokosc_poczatkowa_zajec = parseInt(e.target.parentNode.style.height.slice(0,-2));
        }

        console.log('Stan kursora: ', this.stan_kursora);
    }

    // obsłuż przeciąganie myszą rozpocząte na planszy kalndarza
    obsluzMouseMove(e) {

        console.log('move');
        
        this.stan_kursora.przeciagnieto = true;
        var delta = e.clientY - this.stan_kursora.poczatek_przeciagania;
        if (this.stan_kursora.element.classList.contains('blok-zajec')) {

        }
        else if (this.stan_kursora.element.classList.contains('plan-dnia')) {

        }
        else if (this.stan_kursora.element.classList.contains('uchwyt-gorny')) {

        }
        else if (this.stan_kursora.element.classList.contains('uchwyt-dolny')) {

        }
    }

    // zakończ akcję przeciągania
    obsluzMouseUp(e) {

        console.log('mouseup');

        // zwolnij przekazywanie eventów myszy do tej klasy
        document.onmouseup = null;
        document.onmousemove = null;

        // jeśli nastąpiło przesunięcie myszy po mouse down
        if (this.stan_kursora.przeciagnieto) {

            // tworzenie zajęcia na tle planu dnia
            if (this.stan_kursora.element.classList.contains('plan-dnia')) {
                var poczatek = this.pozycjaNaCzas(this.stan_kursora.poczatek_przeciagania);
                var koniec = this.pozycjaNaCzas(e.clientY);
                this.otworzOknoZajec(undefined, this.stan_kursora.element.getAttribute('num'), poczatek, koniec);
            }

            // przesuwanie istniejących zajęć
            if (this.stan_kursora.element.classList.contains('plan-dnia')) {

            }

            // zmiana górnego położenia zajęć
            if (this.stan_kursora.element.classList.contains('uchwyt-gorny')) {

            }

            // zmiana górnego położenia zajęć
            if (this.stan_kursora.element.classList.contains('uchwyt-dolny')) {

            }
        }
        
        /*
        // jeśli przeciąganie polegało na tworzeniu
        if (this.tryb_przeciagania == 'tworzenie') {
            this.otworzOknoZajec(undefined, e.target.getAttribute('num'), this.poczatek_przeciagania, koniec);
        }

        else if (this.tryb_przeciagania == 'przesuwanie') {
            this.zajecia[this.id_przeciaganego_bloku].poczatek = this.pozycjaNaCzas(parseInt(this.przeciagany_element.style.top.slice(0,-2)));
        }
        */
    }

    // konwertuje pozycję (odległość w minutach od godziny 7.00) na string oznaczający czas w formacie 'hh:mm'
    pozycjaNaCzas(pozycja) {
        if (!pozycja) return undefined;
        var minuty = pozycja % 60;
        var godziny = 7 + Math.floor(pozycja / 60);
        var czas = `${godziny < 10 ? '0' + godziny : godziny}:${minuty < 10 ? '0' + minuty : minuty}`;
        return czas;
    }

    // konwertuje string czasu 'hh:mm" na pozycję tj. odległość w minutach od godziny 7.00
    czasNaPozycje(czas) {
        if (!czas) return undefined;
        var [godziny, minuty] = czas.split(':');
        var pozycja = (parseInt(godziny) - 7) * 60 + parseInt(minuty);
        return pozycja;
    }
}

var menadzer = new CMenadzerPodzialuGodzin();

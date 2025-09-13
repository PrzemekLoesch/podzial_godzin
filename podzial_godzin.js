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

        this.dane = {
            uczniowie: {rekordy: {}, wolne_id: 1, tytul: 'Edycja danych ucznia'},
            przedmioty: {rekordy: {}, wolne_id: 1, tytul: 'Edycja danych przedmiotu'},
            nauczyciele: {rekordy: {}, wolne_id: 1, tytul: 'Edycja danych nauczyciela'},
            lokalizacje: {rekordy: {}, wolne_id: 1, tytul: 'Edycja danych lokalizacji'},
            zajecia: {rekordy: {}, wolne_id: 1, tytul: 'Edycja danych zajęć'},
        }

        // usunięcie wszytkich bloków zajęć z widoku kalendarza
        Array.from(document.querySelectorAll('div[id^="blok_zajec_"]')).forEach(element => element.remove());
    }   

    otworzOkno(nazwa_danych, id) {
        
        var okno = new COknoModalne({
            kontroler: this,
            nazwa_danych: nazwa_danych,
            id: id,
            dane: this.dane[nazwa_danych].rekordy[id],
            tytul: this.dane[nazwa_danych].tytul
        });
    }

    otworzOknoZajec(id, dzien, poczatek, koniec) {

        // jeśli to edycja istniejących zajęć - przypisz dane z obiektu
        if (id) var dane = this.dane.zajecia.rekordy[id];
        
        // jeśli nowe zajęcia - ustaw wartości, które są znane
        else var dane = {
            uczen: null,
            przedmiot: null,
            dzien: dzien,
            poczatek: poczatek,
            koniec: koniec
        };

        var okno = new COknoModalne({
            kontroler: this,
            nazwa_danych: 'zajecia',
            id: id,
            dane: dane,
            opcje: {
                przedmiot: this.dane.przedmioty.rekordy,
                uczen: this.dane.uczniowie.rekordy,
                nauczyciel: this.dane.nauczyciele.rekordy,
                lokalizacja: this.dane.lokalizacje.rekordy
            },
            tytul: this.dane.zajecia.tytul
        });
    }

    zapiszDane(nazwa_danych, id, dane) {

        if (nazwa_danych == 'zajecia') {
            this.zapiszZajecia(id, dane);
            return;
        }

        // edycja istniejącego rekordu
        if (id && document.querySelector(`#${nazwa_danych}_${id}`)) {
            // aktualizacja danych
            this.dane[nazwa_danych].rekordy[id] = dane;
            
            // aktualizacja etykiety
            document.querySelector(`#${nazwa_danych}_${id}`).innerHTML = dane.nazwa;
        }

        // dodanie nowego rekordu lub wprowadzenie rekordu z pliku, który ma już id
        else {
            // pobierz wolne id i zwiększ jego wartość dla następnego rekordu
            if (!id) {
                id = this.dane[nazwa_danych].wolne_id;
                this.dane[nazwa_danych].wolne_id ++;
            }

            // dodaj rekord do list
            this.dane[nazwa_danych].rekordy[id] = dane;

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

        // edycja istniejących zajęć
        if (id && document.getElementById(`blok_zajec_${id}`)) {
            var blok_zajec = document.getElementById(`blok_zajec_${id}`);
            var gora = this.czasNaPozycje(dane.poczatek);
            var wysokosc = this.czasNaPozycje(dane.koniec) - gora;
            blok_zajec.style.top = gora + 'px';
            blok_zajec.style.height = wysokosc + 'px';
            blok_zajec.innerHTML = this.przedmioty[dane.przedmiot].nazwa;
        }

        // dodanie nowych zajęć
        else {
            // ustal nowe id
            if (!id) {
                id = this.dane.zajecia.wolne_id;
                this.dane.zajecia.wolne_id ++;
            }
           
            this.dane.zajecia.rekordy[id] = dane;
            
            
        }
    }

    utworzBlokZajec(dane) {
        
        // skopiuj szablon bloku zajęć
        var blok_zajec = document.querySelector("#blok_zajec").content.cloneNode(true);

        // dodaj blok zajęć do struktury dom
        var element_dnia = document.querySelector(`.plan-dnia[num='${dane.dzien}']`);
        element_dnia.appendChild(blok_zajec);
        blok_zajec = element_dnia.querySelector('.blok-zajec:not([id])');
        blok_zajec.id = `blok_zajec_${id}`;

        this.ustawDaneBlokuZajec(blok_zajec, dane);
    }

    ustawDaneBlokuZajec(blok_zajec, dane) {
        // ustaw parametry bloku
        var gora = this.czasNaPozycje(dane.poczatek);
        var wysokosc = this.czasNaPozycje(dane.koniec) - gora;
        blok_zajec.querySelector('.blok-przedmiot').innerHTML = this.dane.przedmioty.rekordy[dane.przedmiot].nazwa;
        blok_zajec.querySelector('.blok-poczatek').innerHTML = dane.poczatek;
        blok_zajec.querySelector('.blok-koniec').innerHTML = dane.koniec;
        blok_zajec.querySelector('.blok-lokalizacja').innerHTML = dane.lokalizacja ? this.dane.lokalizacje.rekordy[dane.lokalizacja].nazwa : '';
        blok_zajec.querySelector('.blok-nauczyciel').innerHTML = dane.nauczyciel ? this.dane.nauczyciele.rekordy[dane.lokalizacja].nazwa : '';
        blok_zajec.style.top = gora + 'px';
        blok_zajec.style.height = wysokosc + 'px';
    }

    async pobierzPlikDanych() {

        // blob z danymi
        var blob = new Blob([JSON.stringify(this.dane)], { type: 'text/plain' });
        
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
                Object.keys(dane.zajecia.rekordy).forEach(id => this.zapiszZajecia(id, dane.zajecia.rekordy[id]));
            }

            else {
                document.getElementById(`lista_${nazwa_danych}`).innerHTML = '';
                Object.keys(dane[nazwa_danych].rekordy).forEach(id => this.zapiszDane(nazwa_danych, id, dane[nazwa_danych].rekordy[id]));
                this.dane[nazwa_danych].wolne_id = dane[nazwa_danych].wolne_id;
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

        // od tego mmntu adresuj wszystkie eventy dotyczące ruchu myszy do tej klasy
        document.onmouseup = e => this.obsluzMouseUp(e);
        document.onmousemove = e => this.obsluzMouseMove(e);

        // zarejestruj dane naciśnietego elementu
        this.stan_kursora.element = e.target;
        this.stan_kursora.poczatek_przeciagania = e.clientY;
        this.stan_kursora.przeciagnieto = false;
        ['blok-zajec', 'uchwyt-gorny', 'uchwyt-dolny', 'plan-dnia'].forEach(nazwa_klasy => {if (e.target.classList.contains(nazwa_klasy)) this.stan_kursora.nazwa_klasy = nazwa_klasy});

        if (this.stan_kursora.nazwa_klasy === 'blok-zajec') {
            this.stan_kursora.pozycja_poczatkowa_zajec = parseInt(e.target.style.top.slice(0,-2));
        }
        if (this.stan_kursora.nazwa_klasy == 'uchwyt-gorny' || this.stan_kursora.nazwa_klasy == 'uchwyt-dolny') {
            this.stan_kursora.pozycja_poczatkowa_zajec = parseInt(e.target.parentNode.style.top.slice(0,-2));
            this.stan_kursora.wysokosc_poczatkowa_zajec = parseInt(e.target.parentNode.style.height.slice(0,-2));
        }
    }

    // obsłuż przeciąganie myszą rozpocząte na planszy kalndarza
    obsluzMouseMove(e) {

        this.stan_kursora.przeciagnieto = true;
        
        if (this.stan_kursora.nazwa_klasy == 'blok-zajec') {
            // oblicz aktualną pozycję góry
            var top = this.stan_kursora.pozycja_poczatkowa_zajec + e.clientY - this.stan_kursora.poczatek_przeciagania;
            // aktualizuj położenie zajęć
            this.stan_kursora.element.style.top = `${top}px`;
            // aktualizuj dane zajęć
            this.dane.zajecia.rekordy[this.stan_kursora.element.id.split('_')[2]].poczatek = this.pozycjaNaCzas(top);
        }
        else if (this.stan_kursora.element.nazwa_klasy == 'plan-dnia') {
            
            // jeśli wstawiono tymczasowy blok
            if (this.stan_kursora.tymczasowy_element) {

            }

            // jeśli nie wstawiono bloku
            else {

            }
        }
        else if (this.stan_kursora.nazwa_klasy ==  'uchwyt-gorny') {
            var delta = e.clientY - this.stan_kursora.poczatek_przeciagania;
            var blok = this.stan_kursora.element.parentNode;
            blok.style.top = e.clientY+'px';
            blok.style.height = 100 - delta + 'px';
            
        }
        else if (this.stan_kursora.nazwa_klasy == 'uchwyt-dolny') {

        }
    }

    // zakończ akcję przeciągania
    obsluzMouseUp(e) {

        // zwolnij przekazywanie eventów myszy do tej klasy
        document.onmouseup = null;
        document.onmousemove = null;

        // jeśli nastąpiło przesunięcie myszy po mouse down
        if (this.stan_kursora.przeciagnieto) {

            // tworzenie zajęcia na tle planu dnia
            if (this.stan_kursora.element.classList.contains('plan-dnia')) {
                var rect = this.stan_kursora.element.getBoundingClientRect();
                var poczatek = this.pozycjaNaCzas(this.stan_kursora.poczatek_przeciagania - rect.top);
                var koniec = this.pozycjaNaCzas(e.clientY - rect.top);
                this.otworzOknoZajec(null, this.stan_kursora.element.getAttribute('num'), poczatek, koniec);
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

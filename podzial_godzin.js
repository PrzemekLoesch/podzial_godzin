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
        kalendarz.addEventListener('click', e => this.rozpocznijEdycje(e));
        kalendarz.addEventListener('mousedown', e => this.rozpocznijPrzeciaganie(e));

        // zapis pliku danych
        document.getElementById('pobierz_dane').addEventListener('click', () => this.pobierzPlikDanych());

        // odczyt danych z pliku
        document.getElementById('wczytaj_dane').addEventListener('click', () => document.getElementById('zrodlo_danych').click());

        // wczytanie plku
        document.getElementById('zrodlo_danych').addEventListener('change', (e) => this.wczytajPlikDanych(e.target.files[0]));
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
        var okno = new COknoModalne(this, nazwa_danych, id, this.przedmioty[id]);
    }

    otworzOknoZajec(id, dzien, poczatek, koniec) {

        // jeśli to edycja istniejących zajęć - przypisz dane z obiektu
        if (id !== undefined) var dane = this.zajecia[id];
        
        // jeśli nowe zajęcia - ustaw wartości, które są znane
        else var dane = {
            uczen: null,
            przedmiot: null,
            dzien: dzien,
            poczatek: this.pozycjaNaCzas(poczatek),
            koniec: this.pozycjaNaCzas(koniec)
        };

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

        var blob = new Blob([JSON.stringify({uczniowie: this.uczniowie, przedmioty: this.przedmioty, zajecia: this.zajecia})], { type: 'text/plain' });
        var blobURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = 'podzial_godzin.json';
        a.style.display = 'none';
        document.body.append(a);
        // Programmatically click the element.
        a.click();
        // Revoke the blob URL and remove the element.
        setTimeout(() => {
            URL.revokeObjectURL(blobURL);
            a.remove();
        }, 1000);
    };

    wczytajPlikDanych(plik) {
        
        if (plik) {
            var reader = new FileReader();
            reader.onload = (evt) => this.odtworzWidokzDanych(JSON.parse(evt.target.result));
            // reader.onerror = (evt) => document.getElementById("").innerHTML = "Błąd odczytu pliku";
            reader.readAsText(plik, "UTF-8");
        }
    }

    odtworzWidokzDanych(dane) {
        
        // wyczyść obiekty, listy i wodok kalendarza
        this.resetujDane();
        
        Object.keys(dane).forEach(nazwa_danych => {
            if (nazwa_danych == 'zajecia') {
                dane.zajecia.forEach(zajecia => this.zapiszZajecia(undefined, zajecia));
            }

            else {
                this[nazwa_danych] = [];
                console.log(`#lista_${nazwa_danych}`);
                document.getElementById(`lista_${nazwa_danych}`).innerHTML = '';
                dane[nazwa_danych].forEach(rekord => this.zapiszDaneFormularza(nazwa_danych, undefined, rekord));
            }
        });
    }

    wartoscSelect(select) {
        var index = select.selectedIndex;
        return index != -1 ? select.options[index].value : undefined;
    }

    rozpocznijEdycje(e) {

        console.log('Rozpocznij edycję');
        
        // jeśli rozpocząto tryb przeciągania i rzeczywiście przeciągnięto
        if (this.tryb_przeciagania && this.przeciagnieto) return;
        else this.zakonczPrzeciaganie(e);

        // edycja istniejących zajęć
        if (e.target.className == 'blok-zajec') this.otworzOknoZajec(e.target.id.split('_')[1]);

        // dodanie zajęć
        else if (e.target.className == 'plan-dnia') {
            var rect = e.target.getBoundingClientRect();
            var poczatek = e.clientY - rect.top;
            this.otworzOknoZajec(null, e.target.getAttribute('num'), poczatek, null);
        }
    }

    rozpocznijPrzeciaganie(e) {

        console.log('Rozpocznij przeciąganie');
        
        // od tego mmntu adresuj wszystkie eventy dotyczące ruchu myszy do tej klasy
        document.onmouseup = e => this.zakonczPrzeciaganie(e);
        document.onmousemove = e => this.przeciagaj(e);
        
        if (e.target.className == 'plan-dnia') {
            this.tryb_przeciagania = 'tworzenie';
            var rect = e.target.getBoundingClientRect();
            this.poczatek_przeciagania = e.clientY - rect.top;
        }

        else if (e.target.className == 'blok-zajec') {
            this.przeciagany_element = e.target;
            this.id_przeciaganego_bloku = e.target.id.split('_')[2];
            this.tryb_przeciagania = 'przesuwanie';
            this.poczatek_przeciagania = e.clientY;
            console.log('Przeciąganie elementu: ', e.target);
            this.pozycja_poczatkowa = this.czasNaPozycje(this.zajecia[this.id_przeciaganego_bloku].poczatek);
        }
    }

    // obsłuż przeciąganie myszą rozpocząte na planszy kalndarza
    przeciagaj(e) {

        console.log('Przeciągaj');

        this.przeciagnieto = true;

        // jeśli przeciąganie polega na zmienie pozycji zajęć
        if (this.tryb_przeciagania == 'przesuwanie') {
            var delta = e.clientY - this.poczatek_przeciagania;
            this.przeciagany_element.style.top = (this.pozycja_poczatkowa + delta) + 'px';
        }
    }

    // zakończ akcję przeciągania
    zakonczPrzeciaganie(e) {

        console.log('Zakończ przeciąganie');

        // zwolnij przekazywanie eventów myszy do tej klasy
        document.onmouseup = null;
        document.onmousemove = null;
        if (!this.przeciagnieto) {
            this.tryb_przeciagania = null;
            this.przeciagany_element = null;
            return;
        }
        
        var rect = e.target.getBoundingClientRect();
        var koniec = e.clientY - rect.top;

        // jeśli przeciąganie polegało na tworzeniu
        if (this.tryb_przeciagania == 'tworzenie') {
            this.otworzOknoZajec(null, e.target.getAttribute('num'), this.poczatek_przeciagania, koniec, null);
        }

        else if (this.tryb_przeciagania == 'przesuwanie') {
            this.zajecia[this.id_przeciaganego_bloku].poczatek = this.pozycjaNaCzas(parseInt(this.przeciagany_element.style.top.slice(0,-2)));
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

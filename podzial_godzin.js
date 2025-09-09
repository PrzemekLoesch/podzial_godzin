class CMenadzerPodzialuGodzin {
    constructor() {
        
        // włącz eventy
        this.przypiszZdarzenia();

        // pojemniki na dane
        this.uczniowie = [];
        this.przedmioty = [];
        this.zajecia = [];

        // elementy interfejsu
        this.lista_uczniow = document.querySelector('.lista-uczniow');
        this.lista_przedmiotow = document.querySelector('.lista-przedmiotow');
    }

    przypiszZdarzenia() {

        // dodanie ucznia
        document.getElementById('dodaj_ucznia').addEventListener('click', () => this.otworzOknoUcznia());

        // dodanie przedmiotu
        document.getElementById('dodaj_przedmiot').addEventListener('click', () => this.otworzOknoPrzedmiotu());

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

    otworzOknoPrzedmiotu(id) {
        var okno = new COknoModalne(this, 'formularz-przedmiotu', id, this.przedmioty[id]);
    }

    otworzOknoUcznia(id) {
        var okno = new COknoModalne(this, 'formularz-ucznia', id, this.uczniowie[id]);
    }

    otworzOknoZajec(id, dzien, poczatek, koniec) {

        // jeśli to edycja istniejących zajęć - przypisz dane z obiektu
        if (id) var dane = this.zajecia[id];
        
        // jeśli nowe zajęcia - ustaw wartości, które są znane
        else var dane = {
            uczen: null,
            przedmiot: null,
            dzien: dzien,
            poczatek: this.pozycjaNaCzas(poczatek),
            koniec: this.pozycjaNaCzas(koniec)
        };

        var okno = new COknoModalne(this, 'formularz-zajec', id, dane, {przedmiot: this.przedmioty, uczen: this.uczniowie});
    }

    odbierzDaneFormularza(nazwa_formularza, id, dane) {
        if (nazwa_formularza == 'formularz-przedmiotu') this.zapiszPrzedmiot(id, dane);
        else if (nazwa_formularza == 'formularz-ucznia') this.zapiszUcznia(id, dane);
        else if (nazwa_formularza == 'formularz-zajec') this.zapiszZajecia(id, dane);
    }

    zapiszPrzedmiot(id, dane) {

        // edycja przedmiotu
        if (id !== undefined) {
            // aktualizacja danych
            this.przedmioty[id] = dane;
            
            // aktualizacja etykiety
            this.lista_przedmiotow.querySelector(`#przedmiot_${id}`).innerHTML = dane.nazwa;
        }

        // dodanie nowego przedmiotu
        else {
            // dodaj ucznia do listy uczniów
            var id = this.przedmioty.push(dane) - 1;

            // dodaj pozycję listy ul
            var wpis = document.querySelector("#wpis-przedmiotu").content.cloneNode(true);
            var div = wpis.querySelector('div');
            div.innerHTML = dane.nazwa;
            div.id = `przedmiot_${id}`;
            wpis.querySelector('button').addEventListener('click', () => this.otworzOknoPrzedmiotu(id));
            this.lista_przedmiotow.appendChild(wpis);
        }
    }

    zapiszUcznia(id, dane) {

        // edycja ucznia
        if (id !== undefined) {
            // aktualizacja danych
            this.uczniowie[id] = dane;
            
            // aktualizacja etykiety
            this.lista_uczniow.querySelector(`[for='uczen_${id}']`).innerHTML = dane.nazwa;
        }

        // dodanie ucznia
        else {
            // dodaj ucznia do listy uczniów
            var id = this.uczniowie.push(dane) - 1;

            // dodaj pozycję listy ul
            var wpis = document.querySelector("#wpis-ucznia").content.cloneNode(true);
            var label = wpis.querySelector('label');
            label.innerHTML = dane.nazwa;
            label.setAttribute('for', `uczen_${id}`);
            var input = wpis.querySelector('input');
            input.id = `uczen_${id}`;
            input.addEventListener('change', () => this.przelaczWidocznoscUcznia(id));
            input.checked = true;
            wpis.querySelector('button').addEventListener('click', () => this.otworzOknoUcznia(id));
            this.lista_uczniow.appendChild(wpis);
        }
    }

    zapiszZajecia(id, dane) {

        // musi być co najmniej id albo dane
        if (!id && !dane) return;

        // nowe zajęcia
        if (!id) {
            
            // id - indeks zajęć
            id = this.zajecia.push(dane) - 1;
            
            var zajecia = document.createElement('div');
            var gora = this.czasNaPozycje(dane.poczatek);
            var wysokosc = this.czasNaPozycje(dane.koniec) - gora;

            zajecia.className = 'blok-zajec';
            zajecia.style.top = gora + 'px';
            zajecia.style.height = wysokosc + 'px';
            zajecia.innerHTML = this.przedmioty[dane.przedmiot].nazwa;
            zajecia.id = `zajecia_${id}`;
            
            document.querySelectorAll('.plan-dnia')[dane.dzien].appendChild(zajecia);
        }

        // edycja zajęć
        else {
            var zajecia = document.getElementById(`zajecia_${id}`);
            var gora = this.czasNaPozycje(dane.poczatek);
            var wysokosc = this.czasNaPozycje(dane.koniec) - gora;

            zajecia.style.top = gora + 'px';
            zajecia.style.height = wysokosc + 'px';
            zajecia.innerHTML = this.przedmioty[dane.przedmiot].nazwa;
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
            reader.onerror = (evt) => document.getElementById("zawartosc_pliku").innerHTML = "Błąd odczytu pliku";
            reader.readAsText(plik, "UTF-8");
        }
    }

    odtworzWidokzDanych(dane) {
        if (dane.uczniowie) {
            this.uczniowie = [];
            this.lista_uczniow.innerHTML = '';
            dane.uczniowie.forEach(uczen => this.zapiszUcznia(undefined, uczen));
        }

        if (dane.przedmioty) {
            this.przedmioty = [];
            this.lista_przedmiotow.innerHTML = '';
            dane.przedmioty.forEach(przedmiot => this.zapiszPrzedmiot(undefined, przedmiot));
        }

        if (dane.zajecia) {
            this.zajecia = [];
            dane.przedmioty.forEach(zajecia => this.zapiszPrzedmiot(undefined, zajecia));
        }
    }

    przelaczWidocznoscUcznia(id) {
        console.log('Zmiana widoczności ucznia: ', id);
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
            this.id_przeciaganego_bloku = e.target.id.split('_')[1];
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

class CMenadzerPodzialuGodzin {
    constructor() {
        this.przypiszZdarzenia();
        this.wybor_ucznia = document.querySelector('#uczen');
        this.wybor_przedmiotu = document.querySelector('#przedmiot');
        this.wybor_dnia = document.querySelector('#dzien');
        this.poczatek = document.querySelector('#poczatek');
        this.koniec = document.querySelector('#koniec');
        

        this.uczniowie = [];
        this.przedmioty = [];
        this.zajecia = [];
    }

    przypiszZdarzenia() {

        // dodanie ucznia
        document.getElementById('dodaj_ucznia').addEventListener('click', () => this.otworzOknoUcznia());

        // dodanie przedmiotu
        document.getElementById('dodaj_przedmiot').addEventListener('click', () => this.otworzOknoPrzedmiotu());

        // dodanie zajęcia
        document.getElementById('dodaj_zajecie').addEventListener('click', () => this.dodajZajecie());
    }

    otworzOknoPrzedmiotu() {
        var okno = new COknoModalne('formularz-przedmiotu', this);
    }

    otworzOknoUcznia() {
        var okno = new COknoModalne('formularz-ucznia', this);
    }

    odbierzDaneFormularza(nazwa_formularza, dane) {
        if (nazwa_formularza == 'formularz-przedmiotu') this.dodajPrzedmiot(dane);
        else if (nazwa_formularza == 'formularz-ucznia') this.dodajUcznia(dane);
    }

    dodajPrzedmiot(dane) {
        // dodaj opcję do pola select
        var opcja = document.createElement('option');
        opcja.innerHTML = dane.nazwa_przedmiotu;
        if (dane.skrot_nazwy) opcja.innerHTML += ` (${dane.skrot_nazwy})`;
        opcja.value = this.wybor_przedmiotu.options.length;
        this.wybor_przedmiotu.appendChild(opcja);

        // dodaj przedmiot do listy przedmiotów
        this.przedmioty.push({nazwa: dane.nazwa_przedmiotu, skrot: dane.skrot_nazwy, nauczyciel: dane.nauczyciel});
    }

    dodajUcznia(dane) {
        // dodaj opcję do pola select
        var opcja = document.createElement('option');
        opcja.innerHTML = dane.imie_ucznia;
        if (dane.inicjaly_ucznia) opcja.innerHTML += ` (${dane.inicjaly_ucznia})`;
        opcja.value = this.wybor_ucznia.options.length;
        this.wybor_ucznia.appendChild(opcja);

        // dodaj ucznia do listy uczniów
        this.uczniowie.push({imie: dane.imie_ucznia, inicjaly: dane.inicjaly_ucznia});
    }

    dodajZajecie() {
        
        // odczytaj wartości wybrane w panelu
        var uczen = this.wartoscSelect(this.wybor_ucznia);
        var przedmiot = this.wartoscSelect(this.wybor_przedmiotu);
        var dzien = this.wartoscSelect(this.wybor_dnia);
        var poczatek = this.poczatek.value;
        var koniec = this.koniec.value;

        // jeśli brakuje jakiegokolwiek wyboru - wróć
        if (!uczen || !przedmiot || !dzien || !poczatek || !koniec) return;

        // oblicz godziny i minuty początku i końca
        var p_godz = parseInt(poczatek.split(':')[0]);
        var p_min = parseInt(poczatek.split(':')[1]) || 0;
        var k_godz = parseInt(koniec.split(':')[0]);
        var k_min = parseInt(koniec.split(':')[1]) || 0;

        var zajecia = document.createElement('div');
        zajecia.className = 'blok-zajec';
        zajecia.style.marginTop = `${(p_godz-7) * 60 + p_min}px`;
        zajecia.style.height = `${(k_godz-p_godz)*60+(k_min-p_min)}px`;
        zajecia.innerHTML = this.przedmioty[przedmiot].nazwa;
        
        document.querySelectorAll('.widok-dnia')[dzien].appendChild(zajecia);
    }

    wartoscSelect(select) {
        var index = select.selectedIndex;
        return index != -1 ? select.options[index].value : undefined;
    }
}

var menadzer = new CMenadzerPodzialuGodzin();

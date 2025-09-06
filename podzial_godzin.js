class CMenadzerPodzialuGodzin {
    constructor() {
        this.przypiszZdarzenia();
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
        if (nazwa_formularza == 'formularz-przedmiotu') this.dodajPrzdmiot(dane);
        else if (nazwa_formularza == 'formularz-ucznia') this.dodajUcznia(dane);
    }

    dodajPrzdmiot(dane) {
        console.log('Dodaj przedmiot');
    }

    dodajUcznia(dane) {
        console.log('Dodaj ucznia');
    }

    dodajZajecie() {
        console.log('Dodaj zajecie');
    }
}

var menadzer = new CMenadzerPodzialuGodzin();

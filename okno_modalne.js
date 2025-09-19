class COknoModalne {
    /**
     * @param {object} parametry.kontroler Wskaźnik do kontrolera podziału godzin
     * @param {string} parametry.nazwa_danych Nazwa listy z edytowanymi danymi
     * @param {number} parametry.id Indeks edytowanego rekordu w liście danych
     * @param {object} parametry.dane Wartości atrybutów obiektu danych
     * @param {object} parametry.opcje Wartości opcji dla atrybutów referencyjnych
     * @param {string} parametry.tytul Tytuł okna
     */
    constructor(parametry) {

        // zapisz wskaźnik do kontrolera
        this.kontroler = parametry.kontroler;
        this.nazwa_danych = parametry.nazwa_danych;
        this.dane = parametry.dane;
        this.id = parametry.id;

        // zbuduj ciało okna z szablonu
        document.body.appendChild(document.querySelector('#cialo_okna_modalnego').content.cloneNode(true));
        this.element = document.querySelector('div[class="okno-modalne"]');

        // dodaj do pola treści formularz przedmiotu
        this.element.querySelector('.tresc-okna-modalnego').appendChild(document.querySelector(`#formularz_${this.nazwa_danych}`).content.cloneNode(true));

        // włącz przeciąganie okna za pomocą nagłówka i skalowanie za pomocą narożnika
        this.naglowek = this.element.querySelector('.naglowek-okna-modalnego');
        this.naglowek.addEventListener('mousedown', e => this.rozpocznijPrzeciaganie(e));
        
        // ustaw tytuł okna
        if (parametry.tytul) this.element.querySelector('.tytul-okna-modalnego').innerHTML = parametry.tytul;

        // włącz funkcję przycisków
        this.element.querySelector('#zamknij').addEventListener('click', () => this.anulujWysylanie());
        this.element.querySelector('#anuluj').addEventListener('click', () => this.anulujWysylanie());
        this.element.querySelector('#zapisz').addEventListener('click', () => this.wyslijDane());

        // jeśli występuje widget color włącz jego eventy
        var widget_kolor = this.element.querySelector('input[id="kolor"]');
        if (widget_kolor) {
            const wybor_koloru = this.element.querySelector('.wybor-koloru');
            widget_kolor.addEventListener('click', () => {
                if (wybor_koloru.style.display === 'none') wybor_koloru.style.removeProperty('display');
                else wybor_koloru.style.display = 'none';
            });
            wybor_koloru.addEventListener('click', e => {
                if (e.target.className == 'probka-koloru') {
                    widget_kolor.style.backgroundColor = e.target.style.backgroundColor;
                    widget_kolor.style.color = e.target.style.backgroundColor;
                    widget_kolor.value = e.target.style.backgroundColor;
                    wybor_koloru.style.display = 'none';
                }
            });
            if (this.dane && this.dane.kolor) {
                widget_kolor.style.color = this.dane.kolor;
                widget_kolor.style.backgroundColor = this.dane.kolor;
            } 
        }
        
        // przycisk usuń otrzyzmuje event tylko jeśli id jest ustawione, jeśli brak id wyłącz widoczność przycisku
        var usun = this.element.querySelector('#usun');
        if (this.id) usun.addEventListener('click', () => this.zglosUsuniecie());
        else usun.style.display = 'none';

        // wypełnij pola select danymi
        if (parametry.opcje) Object.keys(parametry.opcje).forEach(nazwa_pola => {
            
            // znajdź właściwe pole select
            var select = this.element.querySelector(`#${nazwa_pola}`);

            Object.keys(parametry.opcje[nazwa_pola]).forEach((id_opcji, i) => {
                // dla pól bez wymagania ustawionej wartości dodaj dodatkowo pustą opcję
                if (i == 0 && !select.getAttribute('wymog')) {
                    var op = document.createElement('option');
                    op.innerHTML = '';
                    op.value = '';
                    select.appendChild(op);
                }
                var op = document.createElement('option');
                op.innerHTML = parametry.opcje[nazwa_pola][id_opcji].nazwa;
                op.value = id_opcji;
                select.appendChild(op);
            });
        });

        // jeśli podano dane wypełnij widgety danymi
        if (this.dane) Array.from(this.element.querySelectorAll('input, select')).forEach(widget => widget.value = this.dane[widget.id] || '');
        
        // jeśli nie podano danych ustaw widgety select na brak wyboru
        else Array.from(this.element.querySelectorAll('select')).forEach(widget => widget.value = '');

        // przypisz event po zmianie
        Array.from(this.element.querySelectorAll('input, select')).forEach(widget => widget.addEventListener('change', (e) => this.walidujWidget(e.target)));
            
        // to wywołanie bez argumentów wpisuje na sztywno wymiary okna, żeby nie zmieniały się ona przy zmianie treści, ale użytkownik może zmienić go uchwytami
        this.inicjujWymiary();
        this.wysrodkuj();
    }
        
    // ustawia okno na środku strony
    wysrodkuj() {
        // margines z lewej = połowa różnicy pomiędzy szerokością okna a szerokością viewportu
        this.element.style.left = (window.innerWidth - this.element.clientWidth) / 2 + 'px';
        // margines z lewej = połowa różnicy pomiędzy wysokością okna a wysokością viewportu
        this.element.style.top = (window.innerHeight - this.element.clientHeight) / 2 + 'px';
    }

    ustawWielkosc(szer, wys) {
        if (szer) this.element.style.width = `${szer}px`;
        else this.element.style.removeProperty('width');
        if (wys) this.element.style.height = `${wys > 70 ? wys-70 : 0}px`; // ok 70 zajmuje nagłówek i stopka
        else this.element.style.removeProperty('height'); 
    }

    inicjujWymiary() {
        var rect = this.element.getBoundingClientRect();
        this.min_szer = Math.max(Math.min(rect.width, window.innerWidth), 300);
        this.min_wys = Math.max(Math.min(rect.height, window.innerHeight), 200);
        this.element.style.width = `${this.min_szer}px`;
        this.element.style.height = `${this.min_wys}px`;
    }

    // ustawia parametry początkowe przy rozpocząciu przeciągania okna - mouse drag na nagłówku okna
    rozpocznijPrzeciaganie(e) {
        this.naglowek.style.cursor = 'grabbing';
        // wymusza przekazywanie wszytkich eventów mousemove i mouseup do okna
        document.onmouseup = e => this.zakonczPrzeciaganie(e);
        document.onmousemove = e => this.przeciagajOkno(e);
        this.przeciaganie_aktywne = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startOffsetX = this.element.offsetLeft;
        this.startOffsetY = this.element.offsetTop;
    }

    // zwolnienie przysisku myszy, zakończenie przeciągania
    zakonczPrzeciaganie(e) {
        this.przeciaganie_aktywne = false;
        document.onmouseup = null;
        document.onmousemove = null;
        this.naglowek.style.removeProperty('cursor');
    }

    // przesunięcie okna do aktualnego położenia wskazanego kursorem myszy
    przeciagajOkno(e) {
        if (this.przeciaganie_aktywne) {
            if (e.clientX>10) this.element.style.left = this.startOffsetX + (e.clientX - this.startX)+'px';
            if (e.clientY>10) this.element.style.top = this.startOffsetY + (e.clientY - this.startY)+'px';
        }
    }

    // ustawia lub usuwa stan błędu
    walidujWidget(widget) {
        if (widget.getAttribute('wymog') && !widget.value) {
            widget.classList.add('blad');
            return false;
        }
        else {
            widget.classList.remove('blad');
            return true;
        }
    }

    // przekazuje dane z widgetów do właściciela
    wyslijDane() {

        // odcztytaj i waliduj dane
        var wynik = this.odczytajDane();

        // jeśli dane są niepoprawne wróć
        if (!wynik.poprawnosc) return;

        // wyślij je do kontrolera
        this.kontroler.zapiszDane(this.nazwa_danych, this.id, wynik.dane);
        
        // skasuj instancję
        this.zamknijOkno();
    }

    // anulowanie wysyłana danych - powiadomienie kontrolera
    anulujWysylanie() {

        this.kontroler.anulowanieEdycji(this.nazwa_danych, this.id, this.odczytajDane().dane);
        this.zamknijOkno();
    }

    // wysłanie do kontrolera informacji o usunięciu rekordu przez użytkownika
    zglosUsuniecie() {
        this.kontroler.usunRekord(this.nazwa_danych, this.id);
        this.zamknijOkno();
    }

    // usuwa element okna i kasuje instancję obiektu okna
    zamknijOkno() {
        document.body.removeChild(this.element.parentNode);
        delete this;
    }

    // odczytuje dane i waliduje je w zakresie wypełnienia wymaganych pól
    odczytajDane() {

        // założenie kompletności
        var poprawnosc = true;
        
        // dane odczytane z widgetów
        var dane = Object.fromEntries(Array.from(this.element.querySelectorAll('input, select')).map(widget => {
            
            // waliduj widget
            if (!this.walidujWidget(widget)) poprawnosc = false;
            
            // dopisz klucz i wartość do słownika danych
            return [widget.id, widget.value];
        }));

        // dopisz dane, których nie było w widgetach ale zostały podane przez właściciela
        if (this.dane) Object.keys(this.dane).forEach(klucz => {if (!dane.hasOwnProperty(klucz)) dane[klucz] = this.dane[klucz]});

        return {dane: dane, poprawnosc: poprawnosc};
    }
}

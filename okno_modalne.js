class COknoModalne {

    constructor(nazwa_formularza, kontroler) {
        
        // zapisz wskaźnik do kontrolera
        this.kontroler = kontroler;
        this.nazwa_formularza = nazwa_formularza;

        // zbuduj ciało okna z szablonu
        document.body.appendChild(document.querySelector('#cialo-okna-modalnego').content.cloneNode(true));
        this.element = document.querySelector('div[class="okno-modalne"]');

        // dodaj do pola treści formularz przedmiotu
        this.element.querySelector('.tresc-okna-modalnego').appendChild(document.querySelector(`#${nazwa_formularza}`).content.cloneNode(true));

        // włącz przeciąganie okna za pomocą nagłówka i skalowanie za pomocą narożnika
        this.naglowek = this.element.querySelector('.naglowek-okna-modalnego');
        this.naglowek.addEventListener('mousedown', e => this.rozpocznijPrzeciaganie(e));

        // włącz funkcję przycisków
        this.element.querySelector('#zamknij').addEventListener('click', () => this.usunOkno());
        this.element.querySelector('#anuluj').addEventListener('click', () => this.usunOkno());
        this.element.querySelector('#dodaj').addEventListener('click', () => this.wyslijDane());


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

    rozpocznijSkalowanie(e) {
        document.onmouseup = e => this.zakonczSkalowanie(e);
        document.onmousemove = e => this.skalujOkno(e);
        this.skalowanie_aktywne = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startWidth = parseInt(window.getComputedStyle(this.element, null).getPropertyValue('width').slice(0,-2));
        this.startHeight = parseInt(window.getComputedStyle(this.element, null).getPropertyValue('height').slice(0,-2));
    }

    zakonczSkalowanie() {
        this.skalowanie_aktywne = false;
        document.onmouseup = null;
        document.onmousemove = null;
    }

    skalujOkno(e) {
        if (this.skalowanie_aktywne) {
            var szer = Math.max(this.startWidth + (e.clientX - this.startX) < 0 ? 0 : this.startWidth + (e.clientX - this.startX), this.min_szer);
            var wys = Math.max(this.startHeight + (e.clientY - this.startY) < 0 ? 0 : this.startHeight + (e.clientY - this.startY), this.min_wys);
            this.element.style.width = szer+'px';
            this.element.style.height = wys+'px';
        }
    }

    wyslijDane() {
        var dane = Object.fromEntries(Array.from(this.element.querySelectorAll('input')).map(input => [input.id, input.value]));
        this.kontroler.odbierzDaneFormularza(this.nazwa_formularza, dane);
        this.usunOkno();
    }

    usunOkno() {
        document.body.removeChild(this.element.parentNode);
        delete this;
    }
}

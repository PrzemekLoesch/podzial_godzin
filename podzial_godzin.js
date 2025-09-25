class CKontrolerPodzialuGodzin {
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
        kalendarz.addEventListener('click', e => this.obsluzMouseClick(e));
        kalendarz.addEventListener('mousedown', e => this.obsluzMouseDown(e));
        
        // dodaj dla każdego elementu planu dnia event wjechania kursorem - do przeoszenia zajęć
        Array.from(kalendarz.querySelectorAll('.plan-dnia')).forEach(plan_dnia => plan_dnia.addEventListener('mouseenter', e => this.obsluzMouseEnter(e)));

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

    // odebranie od formularza informacji o anulowaniu edycji
    anulowanieEdycji(nazwa_danych, id, dane) {

        // jeśli zamknięto okno edycji nowych zajęć bez zapisania
        if (nazwa_danych == 'zajecia' && !id) {
            // trzeba usunąć niepotrzebny blok zajęć
            var blok = document.querySelector('.blok-zajec[id$=null]');
            if (blok) blok.remove();
        }
    }

    usunRekord(nazwa_danych, id) {
        
        // dla zajęć uzuń blok i ponownie rozwiąż kolizje dla tego dnia
        if (nazwa_danych == 'zajecia') {
            document.querySelector(`#blok_zajec_${id}`).remove();
            this.rozwiazKolizjeZajec(this.dane[nazwa_danych].rekordy[id].dzien);
        }

        // dla pozostałych usuń wpis
        else document.querySelector(`#${nazwa_danych}_${id}`).remove();

        // usuń rekord
        delete this.dane[nazwa_danych].rekordy[id];
    }

    // dla danych: uczniowie, przedmioty, nauczyciele, lokalizacje - tworzy nowe rekordy w obiekcie dane lub aktualizuje rekord jeśli podano id
    // zawsze aktualizuje widok rekordu na liście
    zapiszDane(nazwa_danych, id, dane) {

        // dla danych zajęć odsyłaj do funkcji speocjalistycznej
        if (nazwa_danych == 'zajecia') {
            this.zapiszZajecia(id, dane);
            return;
        }

        // spróbuj element rekordu na liście 
        var wpis = document.querySelector(`#${nazwa_danych}_${id}`);

        // edycja istniejącego rekordu
        if (id && wpis) {
            
            // aktualizacja danych
            wpis.querySelector('.nazwa-rekordu').innerHTML = dane.nazwa;
            if (dane.kolor) wpis.style.backgroundColor = dane.kolor;
        }

        // dodanie nowego rekordu lub wprowadzenie rekordu z pliku, który ma już id
        else {
            // pobierz wolne id i zwiększ jego wartość dla następnego rekordu
            if (!id) {
                id = this.dane[nazwa_danych].wolne_id;
                this.dane[nazwa_danych].wolne_id ++;
            }

            // dodaj pozycję listy i ustaw jej parametry
            var wpis = document.querySelector("#wpis_listy_rekordow").content.cloneNode(true);
            wpis.querySelector('.wpis-listy-rekordow').id = `${nazwa_danych}_${id}`;
            wpis.querySelector('.nazwa-rekordu').innerHTML = dane.nazwa;
            wpis.querySelector('.przycisk-edycji').addEventListener('click', () => this.otworzOkno(nazwa_danych, id));
            if (dane.kolor) wpis.querySelector('.wpis-listy-rekordow').style.backgroundColor = dane.kolor;

            // dopisz pozycję do listy
            document.querySelector(`#lista_${nazwa_danych}`).appendChild(wpis);
        }

        // aktualizuj lub dodaj rekord w obiekcie danych
        this.dane[nazwa_danych].rekordy[id] = dane;

        // aktualizuj kolory jeśli w danych był zawarty atrybut kolor
        if (dane.kolor) Array.from(document.querySelectorAll(`[kolor="${nazwa_danych}_${id}"]`)).forEach(element => element.style.backgroundColor = dane.kolor);

        // aktualizuj pozostałe parametry
        Object.keys(dane).forEach(atrybut => {
            Array.from(document.querySelectorAll(`[ref="${nazwa_danych}_${atrybut}_${id}"]`)).forEach(element => element.innerHTML = dane[atrybut]);
        });
        
    }

    // funkcja specjalistyczna dla danych zajęć:
    // - tworzy nowy rekord lub aktualizuje istniejący jeśli podano id
    // - tworzy nowy element blok-zajec na kalendarzu lub aktualizuje jego dane
    zapiszZajecia(id, dane) {

        // utworzenie nowych zajęć poprzez przeciąganie
        if (id === null) {
            id = this.dane.zajecia.wolne_id;
            this.dane.zajecia.wolne_id ++;
            var blok = document.getElementById(`blok_zajec_null`);
            blok.id = `blok_zajec_${id}`;
        }

        // jeśli podano id spróbuj odnaleźć właściwy blok zajęć
        else var blok = document.getElementById(`blok_zajec_${id}`);

        // jeśli występuje już ten blok to zaktualizuj jego dane
        if (blok) this.aktualizujBlokZajec(blok, dane);

        // jeśli nie występuje (po odczycie danych z pliku) utwórz ten blok i od razu ustaw jego dane
        else this.utworzBlokZajec(id, dane);

        // rozwiąż kolizje zajęć dla tego dnia
        this.rozwiazKolizjeZajec(dane.dzien);
        
        // aktualizacja rekordu
        this.dane.zajecia.rekordy[id] = dane;
    }

    // tworzy nowy blok zajęć
    utworzBlokZajec(id, dane) {
        
        // skopiuj szablon bloku zajęć
        var blok_zajec = document.querySelector("#blok_zajec").content.cloneNode(true);

        // dodaj blok zajęć do struktury dom
        var element_dnia = document.querySelector(`.plan-dnia[num='${dane.dzien}']`);
        element_dnia.appendChild(blok_zajec);
        blok_zajec = element_dnia.querySelector('.blok-zajec:not([id])');
        blok_zajec.id = `blok_zajec_${id}`;
        blok_zajec.setAttribute('kolor', `uczniowie_${dane.uczen}`);
 
        this.aktualizujBlokZajec(blok_zajec, dane);

        return blok_zajec;
    }

    // aktualizuje widok blok zajęć po wprowadzeniu / zmianie danych
    aktualizujBlokZajec(blok_zajec, dane) {

        // ustaw parametry bloku
        var gora = this.czasNaPozycje(dane.poczatek);
        var wysokosc = this.czasNaPozycje(dane.koniec) - gora;
        
        // ustaw aktualną geometrię
        blok_zajec.querySelector('.blok-poczatek').innerHTML = dane.poczatek;
        blok_zajec.querySelector('.blok-koniec').innerHTML = dane.koniec;
        blok_zajec.style.top = gora + 'px';
        blok_zajec.style.height = wysokosc + 'px';
        if (dane.uczen) blok_zajec.style.backgroundColor = this.dane.uczniowie.rekordy[dane.uczen].kolor; 

        // aktualizuj opis danych, które podano
        if (dane.przedmiot) {
            var przedmiot = blok_zajec.querySelector('.blok-przedmiot');
            przedmiot.innerHTML = this.dane.przedmioty.rekordy[dane.przedmiot].nazwa;
            przedmiot.setAttribute('ref', `przedmioty_nazwa_${dane.przedmiot}`);
        }
        if (dane.lokalizacja) {
            var lokalizacja = blok_zajec.querySelector('.blok-lokalizacja');
            lokalizacja.innerHTML = this.dane.lokalizacje.rekordy[dane.lokalizacja].nazwa;
            lokalizacja.setAttribute('ref', `lokalizacje_nazwa_${dane.lokalizacja}`);
        }
        if (dane.nauczyciel) {
            var nauczyciel = blok_zajec.querySelector('.blok-nauczyciel');
            nauczyciel.innerHTML = this.dane.nauczyciele.rekordy[dane.nauczyciel].nazwa;
            nauczyciel.setAttribute('ref', `nauczyciele_nazwa_${dane.nauczyciel}`);
        }
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
            
            // tworzenie bloków zajęć
            if (nazwa_danych == 'zajecia') {
                Object.keys(dane.zajecia.rekordy).forEach(id => this.zapiszZajecia(id, dane.zajecia.rekordy[id]));
            }

            // tworzenie list rekordów
            else {
                document.getElementById(`lista_${nazwa_danych}`).innerHTML = '';
                Object.keys(dane[nazwa_danych].rekordy).forEach(id => this.zapiszDane(nazwa_danych, id, dane[nazwa_danych].rekordy[id]));
                this.dane[nazwa_danych].wolne_id = dane[nazwa_danych].wolne_id;
            }

            // ustawienie wolnego id dla każdej grupy danych
            this.dane[nazwa_danych].wolne_id = dane[nazwa_danych].wolne_id;
        });
    }

    // odczytuje wartość wybranej opcji z widgetu select
    wartoscSelect(select) {
        var index = select.selectedIndex;
        return index != -1 ? select.options[index].value : undefined;
    }

    
    // rozpoczyna edycję elementu kalendarza
    obsluzMouseClick(e) {

        // jeśli wcześniej odbyło się przeciąganie - nie rób nic - akcje zostały obsłużone przez mouseMove i mouseUp
        if (this.stan_kursora.przeciagnieto) return;

        // edycja istniejących zajęć
        if (['blok-zajec', 'blok-poczatek', 'blok-koniec', 'blok-przedmiot', 'blok-uczen', 'blok-nauczyciel', 'blok-lokalizacja'].find(klasa => e.target.classList.contains(klasa))) {
            this.otworzOknoZajec(e.target.closest('.blok-zajec').id.split('_')[2]);
        }
        
        // dodanie zajęć
        else if (e.target.classList.contains('plan-dnia')) {
            var rect = e.target.getBoundingClientRect();
            var poczatek = e.clientY - rect.top;
            this.otworzOknoZajec(null, e.target.getAttribute('num'), this.pozycjaNaCzas(poczatek), null);
        }

        // zeruj stan kursora
        this.stan_kursora = {};
    }

    // rejestruje dane naciśniętego elementu na kalendarzu, które decydują co dajej robić w click, move i mouseUp
    obsluzMouseDown(e) {

        this.stan_kursora = {};

        // od tego mmntu adresuj wszystkie eventy dotyczące ruchu myszy do tej klasy
        document.onmouseup = e => this.obsluzMouseUp(e);
        document.onmousemove = e => this.obsluzMouseMove(e);

        // zarejestruj dane naciśnietego elementu
        this.stan_kursora.poczatek_przeciagania = e.clientY;
        this.stan_kursora.przeciagnieto = false;
        
        // ustalenie jaki element naciśnięto i ew. przekierowanie na rodzica

        // zapisanie klasy i elementu dla naciśniętych elementów, które bezpośrednio obsługują akcję
        ['blok-zajec', 'uchwyt-bloku', 'plan-dnia'].forEach(nazwa_klasy => {if (e.target.classList.contains(nazwa_klasy)) {
            this.stan_kursora.nazwa_klasy = nazwa_klasy;
            this.stan_kursora.element = e.target;
        }});

        // zapisanie klasy i elementu dla naciśniętych elementów, zagnieżdżonych - zapisanie danych bloku zajęć
        ['blok-poczatek', 'blok-koniec', 'blok-przedmiot', 'blok-uczen', 'blok-nauczyciel', 'blok-lokalizacja', 'blok-czas'].forEach(nazwa_klasy => {if (e.target.classList.contains(nazwa_klasy)) {
            this.stan_kursora.nazwa_klasy = 'blok-zajec';
            this.stan_kursora.element = e.target.closest('.blok-zajec');
        }});

        // ustawienie parametrów w zależności od tego co kliknięto

        // naciśnięto istniejący blok zajęć
        if (this.stan_kursora.nazwa_klasy == 'blok-zajec') {
            this.stan_kursora.pozycja_poczatkowa_zajec = parseInt(this.stan_kursora.element.style.top.slice(0,-2));
            this.stan_kursora.wysokosc_poczatkowa_zajec = parseInt(this.stan_kursora.element.style.height.slice(0,-2));
        }
        
        // naciśnieto uchwyt dolny
        if (this.stan_kursora.nazwa_klasy == 'uchwyt-bloku') {
            this.stan_kursora.pozycja_poczatkowa_zajec = parseInt(e.target.parentNode.style.top.slice(0,-2));
            this.stan_kursora.wysokosc_poczatkowa_zajec = parseInt(e.target.parentNode.style.height.slice(0,-2));
        }
    }

    // obsłuż przeciąganie myszą rozpocząte na planszy kalndarza
    obsluzMouseMove(e) {

        // ustaw flagę rozpoczęcia przeciągania
        this.stan_kursora.przeciagnieto = true;
        
        // przeciąganie bloku zajeć
        if (this.stan_kursora.nazwa_klasy == 'blok-zajec') {
            
            // obliczenie pozycji początkowej
            var wymiary = this.wymiaryPrzeciaganegoBlokuZajec(e.clientY);

            // aktualizuj położenie zajęć
            this.stan_kursora.element.style.top = `${wymiary.poczatek}px`;

            // aktualizuj wyświetlane wartości początku i końca zajęć
            this.stan_kursora.element.querySelector('.blok-poczatek').innerHTML = this.pozycjaNaCzas(wymiary.poczatek);
            this.stan_kursora.element.querySelector('.blok-koniec').innerHTML = this.pozycjaNaCzas(wymiary.koniec);

            // kursor grabbing
            this.stan_kursora.element.style.cursor = 'grabbing';

            // rozwiązanie kolizji z innymi zajęciami
            this.rozwiazKolizjeZajec(this.stan_kursora.element.parentNode.getAttribute('num'));
        }

        // rozpoczęto przeciąganie po planie dnia - utworzenie nowego bloku zajęć
        else if (this.stan_kursora.nazwa_klasy == 'plan-dnia') {

            // zapisz parametry początkowe przeciąganego bloku do stanu kursora
            var poczatek = e.clientY - e.target.getBoundingClientRect().top;
            poczatek = Math.floor(poczatek / 5) * 5;
            this.stan_kursora.nazwa_klasy = 'uchwyt-bloku';
            this.stan_kursora.pozycja_poczatkowa_zajec = poczatek;         
            this.stan_kursora.poczatek_przeciagania = e.clientY;
            this.stan_kursora.wysokosc_poczatkowa_zajec = 0;

            // utwórz nowy blok zajęć z id=null
            var element = this.utworzBlokZajec(null, {
                poczatek: this.pozycjaNaCzas(poczatek),
                koniec: this.pozycjaNaCzas(poczatek),
                dzien: e.target.getAttribute('num')
            });

            // przypisz element uchwytu dolnego jako odbiorcę akcji przeciągania
            this.stan_kursora.element = element.querySelector('.uchwyt-bloku');
        }

        // przeciąganie dolnej krawędzi - zmiana końca zajęć
        else if (this.stan_kursora.nazwa_klasy == 'uchwyt-bloku') {
            var blok = this.stan_kursora.element.parentNode;
            var wymiary = this.wymiaryPrzeciaganegoBlokuZajec(e.clientY);
            blok.style.height = wymiary.wysokosc + 'px';
            blok.querySelector('.blok-koniec').innerHTML = this.pozycjaNaCzas(wymiary.koniec);
            
            // dla bloku, który jest dopiero tworzony zamiast nazwy zajęć podaj czas ich trwania
            var id = blok.id.split('_')[2];
            if (id == 'null') {
                blok.querySelector('.blok-przedmiot').innerHTML = `(${wymiary.wysokosc >= 60 ? Math.floor(wymiary.wysokosc / 60) + ' godz. ' : ''}${wymiary.wysokosc % 60} min.)`;
            }

            // rozwiązanie kolizji z innymi zajęciami
            this.rozwiazKolizjeZajec(blok.parentNode.getAttribute('num'));
        }
    }

    // zakończ akcję przeciągania
    obsluzMouseUp(e) {

        // zwolnij przekazywanie eventów myszy do tej klasy
        document.onmouseup = null;
        document.onmousemove = null;

        // jeśli nastąpiło przesunięcie myszy po mouse down
        if (this.stan_kursora.przeciagnieto) {

            // zmiana czasu początkowego i końcowego
            if (this.stan_kursora.nazwa_klasy == 'blok-zajec') {
                var blok = this.stan_kursora.element;
                blok.style.removeProperty('cursor');
                var poczatek = blok.querySelector('.blok-poczatek').innerHTML;
                var koniec = blok.querySelector('.blok-koniec').innerHTML;
                var rekord = this.dane.zajecia.rekordy[blok.id.split('_')[2]];
                rekord.poczatek = poczatek;
                rekord.koniec = koniec;
                rekord.dzien = blok.closest('.plan-dnia').getAttribute('num');
            }

            // zmiana dolnego położenia zajęć
            if (this.stan_kursora.nazwa_klasy == 'uchwyt-bloku') {

                // id zmienianego bloku zajęć
                var blok = this.stan_kursora.element.parentNode;
                var id = blok.id.split('_')[2];

                // jeśli przeciąganie dotyczyło tworzenia nowego bloku zajęć (puste id)
                if (id == 'null') {
                    var poczatek = blok.querySelector('.blok-poczatek').innerHTML;
                    var koniec = blok.querySelector('.blok-koniec').innerHTML;
                    var dzien = blok.parentNode.getAttribute('num');
                    this.otworzOknoZajec(null, dzien, poczatek, koniec);
                }

                // przeciąganie dotyczyło wydłużenia / skrócenia zadania
                else {
                    var koniec = blok.querySelector('.blok-koniec').innerHTML;
                    this.dane.zajecia.rekordy[blok.id.split('_')[2]].koniec = koniec;
                }
            }
        }

        // wyzeruj stan kursora - pozostaw tylko flagę przeciągnięcia w swoim stanie, żeby prawidłowo rozpoznać działanie w mouseClick
        this.stan_kursora = {przeciagnieto: this.stan_kursora.przeciagnieto};
    }

    // obsługa przenoszenia bloku zajęć na inne dni
    obsluzMouseEnter(e) {

        // jeśli wjechano na ten element kursorem w trakcie przeciągania bloku zajęć, który należy do innego dnia
        if (this.stan_kursora.nazwa_klasy == 'blok-zajec' && !e.target.contains(this.stan_kursora.element)) {
            
            // zapamietaj dotychczasowy dzień, do którego przypisany jest blok zajęć
            var dzien = this.stan_kursora.element.closest('.plan-dnia').getAttribute('num');
            
            // przypisz blok zajęć do elemntu dnia, który otrzymał event mouseenter
            e.target.appendChild(this.stan_kursora.element);

            // uporządkuj poprzedni dzień
            this.rozwiazKolizjeZajec(dzien);
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

    // oblicza i zwraca obiekt {poczate, koniec, wysokosc} z wymiarami bloku zajęć liczonymi w pikselach
    wymiaryPrzeciaganegoBlokuZajec(clientY) {
        
        // o ile przesunięto mysz w pionie od pierwszego mouseDown
        var delta = clientY - this.stan_kursora.poczatek_przeciagania;

        // jeśli przesuwany jest cały blok zajęć
        if (this.stan_kursora.nazwa_klasy == 'blok-zajec') {
            var poczatek = this.stan_kursora.pozycja_poczatkowa_zajec + delta;
            var wysokosc = this.stan_kursora.wysokosc_poczatkowa_zajec;
        }

        // jeśli zajęcia są wydłużane / skracane uchwytem dolnym
        if (this.stan_kursora.nazwa_klasy == 'uchwyt-bloku') {
            var poczatek = this.stan_kursora.pozycja_poczatkowa_zajec;
            var wysokosc = this.stan_kursora.wysokosc_poczatkowa_zajec + delta;
            if (wysokosc < 5) wysokosc = 5;
        }

        // zaokrąglenie do wielokrotności 5px
        poczatek = Math.floor(poczatek / 5) * 5;
        wysokosc = Math.floor(wysokosc / 5) * 5;

        // zwróc obiekt z atrybutami wymiarów
        return {
            poczatek: poczatek,
            koniec: poczatek + wysokosc,
            wysokosc: wysokosc
        }
    }

    // ustawia szrokość i położenie zajęć, tak, żeby się na siebie nie nakładały
    rozwiazKolizjeZajec(numer_dnia) {

        // znajdź wszystkie bloki zajęć z tego dnia
        var bloki = Array.from(document.querySelector(`.plan-dnia[num="${numer_dnia}"]`).querySelectorAll('.blok-zajec'));

        if (!bloki.length) return;

        // posortuj bloki od najwyżej położonego
        bloki.sort((a, b) => parseInt(a.style.top.slice(0, -2)) - parseInt(b.style.top.slice(0, -2)));

        // założenie wstępne ustawienia bloku w pierwszej kolumnie
        bloki.forEach(blok => {
            blok.kolumna = 1;
            blok.sasiedzi = [];
            blok.szerokosc = undefined;
            blok.lewy = undefined;
        });

        // przejdź przez wszytkie bloki
        bloki.forEach((blok, i) => {
            // przesuwaj o jedną kolumę dopóki występuje kolizja z innymi blokami zajęć już rozstawionymi (do obecnego indeksu)
            while (this.sprawdzKolizjeZajec(blok, bloki.slice(0, i))) blok.kolumna ++;
        });

        // posortuj bloki - najpierw te posiadające największą liczbę przesunięć na prawo (lewych sąsiadów)
        bloki = bloki.sort((a, b) => b.kolumna - a.kolumna);

        // przejdź jeszcze raz przez bloki i ustaw ich atrybuty stylu
        bloki.forEach(blok => {
            // jeśli blok ma sąsiedów ustaw jego zredukowaną szerokość i przesuń na właściwą kolumnę
            blok.style.left = (blok.kolumna -1) * 25 + '%';
            blok.style.width = '25%';
        });

        // budowa piramid z wierzchołkiem po prawej i ustawieniem szerokości wszytkich bloków pod wierzchołkiem i na wierzchołakch sąsiednich oraz bloków be sąsiadów
        bloki.forEach(blok => {

            // jeśli blok nie ma sąsiadów jego szerokość to 100%
            if (!blok.sasiedzi.length) {
                blok.szerokosc = 100;
                blok.querySelector('.blok-przedmiot').innerHTML = blok.szerokosc;
                return;
            }

            // odfiltruj tyko tych sąsiadów, którzy są na lewo
            var lewi_sasiedzi = blok.sasiedzi.filter(sasiad => sasiad.kolumna < blok.kolumna);

            // jeśli żaden z lewych sąsiadów nie ma jeszcze ustalonej szerokości
            if (lewi_sasiedzi.length && lewi_sasiedzi.every(ls => !ls.szerokosc)) {
                var szerokosc = 100 / blok.kolumna;
                this.ustawSzerkoscLewychSasiadow(blok, szerokosc);
            }

            // jeśli blok nie ma jeszcze ustawionej szerokości i nie jest położony w pierwszej kolumnie, musi należeć do innego, niższego lub równego wierzchołka
            else if (blok.kolumna != 1 && !blok.szerokosc) {
                var szerokosc_lewych = 0;
                var lewy = blok.lewy;
                while (lewy) {
                    szerokosc_lewych += lewy.szerokosc;
                    lewy = lewy.lewy;
                }
                blok.szerokosc = 100 - szerokosc_lewych;
                blok.querySelector('.blok-przedmiot').innerHTML = blok.szerokosc;
            }
        });

        // zostały tylko bloki bez lewych sąsiadów, ale ograniczone z prawej strony
        bloki.forEach(blok => {
            // znajdź prawego sąsiada położonego najbliżej bloku
            var kolumna_prawego = Math.min(...blok.sasiedzi.filter(sasiad => sasiad.kolumna > blok.kolumna).map(sasiad => sasiad.kolumna));
        });
    }

    // iteracyjnie ustawiania szerokości wszytkich lewych sąsiadów bloku
    ustawSzerkoscLewychSasiadow(blok, szerokosc) {
        blok.szerokosc = szerokosc;
        blok.querySelector('.blok-przedmiot').innerHTML = szerokosc;
        // iteracyjnie powtórz dla sąsiadów
        blok.sasiedzi.forEach(s => {
            // tylko w lewą stronę - na niższych kolumnach
            if (s.kolumna < blok.kolumna && !s.szerokosc) {
                s.szerokosc = szerokosc;
                s.querySelector('.blok-przedmiot').innerHTML = szerokosc;
                this.ustawSzerkoscLewychSasiadow(s, szerokosc);
            }
        });
    }

    // zwraca wynik testu na kolizję z innymi blokami: true = występuje kolizja
    sprawdzKolizjeZajec(blok, bloki) {

        // góra i dół analizowanego bloku - obliczenia jednokrotne
        var gora_1 = parseInt(blok.style.top.slice(0,-2));
        var dol_1 = gora_1 + parseInt(blok.style.height.slice(0, -2));

        // założenie wstępne
        var kolizja = false;

        // kolizja jest wtedy, gdy: bloki są w tej samej kolumnie i pierwszy kończy się niżej niż zaczyna drugi lub odwrotnie
        bloki.forEach(blok_porownywany => {

            // góra i dół bloku porównywanego
            var gora_2 = parseInt(blok_porownywany.style.top.slice(0,-2));
            var dol_2 = gora_2 + parseInt(blok_porownywany.style.height.slice(0, -2));

            // jeśli porównywany blok zaczyna się powyżej a kończy poniżej początku tego drugiego lub
            // jeśli porównywany blok zaczyna się poniżej początku i powyżej końca tego drugiego to znaczy, że zachodzą na siebie
            if ((gora_2 <= gora_1 && dol_2 > gora_1) || (gora_2 >= gora_1 && dol_1 > gora_2)) {
                
                // jeśli bloki zachodzące na siebie wysokością są w tej samej kolumnie - występuja kolizja
                if (blok.kolumna == blok_porownywany.kolumna) {
                    
                    // ustaw flagę kolizji
                    kolizja = true;
                    blok.lewy = blok_porownywany;
                }

                // dopisz obustronnie indeksy sąsiadów do listy
                if (!blok.sasiedzi.find(s => s.id == blok_porownywany.id)) blok.sasiedzi.push(blok_porownywany);
                if (!blok_porownywany.sasiedzi.find(s => s.id == blok.id)) blok_porownywany.sasiedzi.push(blok);
            }
        });

        // zwróć wynik analizy kolizji
        return kolizja;
    }
}

var kontroler = new CKontrolerPodzialuGodzin();

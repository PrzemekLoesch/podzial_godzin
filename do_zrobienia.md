# 6.09.2025
- [x] odczytywać wszystkie pola input przez formularz
- [x] przesyłać obiekt wartości pól do kontrolera
- [x] dodawać przez kontroler opcje w selektorach uczniów i przedmiotów
- [x] odczytywać dane z pól panelu
- [x] dodawać elementy zajęć na kalendarzu - prawidłowo pozycjonować
- [x] budować strukturę JSON na podstawie zawartości kalendarza
- [x] pokazać wszystkie dodane dzieci i przedmioty na liście, wybierać z niej aktualne dane poprzez zaznaczenie
- [x] checkboxy do zaznaczania, które dzieci mają być pokazane na podziale godzin
- [ ] dodatkowe div'y dla każdego dziecka w div widoku dnia
- [x] lista uczniów z możliwością dodawania, edycji i zaznaczenia opcji wyświetlania na podziałgodzinie
- [x] dodawanie wizualne poprzez kliknięcie na pole dnia

# 7.09.2025
- [x] przekazywać dane edytowanego ucznia i przedmiotu do formularza
- [x] przy zapisie danych ucznia i przedmiotu wstawiać nowy rekord lub nadpisywać dane jeśli podano id
- [x] aktualizować etykiety uczniów i przedmiotów po edycji
- [x] szablon formularza edycji zajęcia: przedmiot, uczeń, początek, koniec
- [x] przekazywać do formularza dane opcji do wypełnienia pól select
- [x] oczytywać czas na podstawie punktu kliknięcia na kalendarzu
- [x] obsługa przeciągania myszką na kalendarzu
- [x] oznaczyć wymagane pola atrybutem 'wymagane'
- [x] ustawiać niewybrane pozycje select jako puste
- [x] zapisywać dane w json (pobranie pliku) oraz odczyt danych z przesłanego pliku
- [ ] zaokrąglać wartości godzin wskazywane kursorem do 5 minut

# 8.09.2025
- [x] przy przesuwaniu korzystać z bezwzględnych współrzędnych myszy a nie z e.target
- [x] skok przesuwania co 5 minut (5 pixeli)
- [ ] blokada możliwości przesuwania poza zakres kalendarza
- [x] gripy do przeciągania góry i dołu zajęcia
- [x] wskazywanie czasu początku i końca zajęcia
- [x] przywrócić możliwość edycji po kliknięciu na blok zajęć
- [x] odczytywać dane z pliku

# 9.09.2025
- [x] usuwać z widoku zajęcia po wczytaniu danych z pliku
- [x] rozmieszczać prawidłowo nowe zajęcia po wczytaniu pliku
- [x] zapewnić integralność id danych po zapisie i wczytaniu pliku
- [x] wyseparować nauczycieli do osobnego obiektu (ten sam przedmiot mogą prowadzić rózni nauczyciele)
- [x] dodać lokalizację (sala, miejsce itp.)
- [x] indeksy rekordów zaczynać od 1 - ułatwi ew. późniejszy zapis do db - najprościej zainicjować tablice wartością i usunąć ją

# 10.09.2025
- [x] rozwiązać poprawne rozróżnianie akcji edycji od akcji przeciągania - flagę przeciągania ustawiać dopiwro w evencie move

# 11.09.2025
- [x] wyświetlanie pozostałych danych na bloku zajęć w polu dnia - zaobaczyć jak to wygląda na vulcanie i innych
- [x] skorygować prawidłową pozycję Y odczytaną przy przeciąganiu po plane dnia
- [x] blok zajęć wstawiać na podstawie template, w obsluzMouseDown rozpoznawać również kliknięcia na klasach skladowych

# 12.09.2025
- [x] w czesie przeciągania po planie dnia wyświetlać tymczasowy div
- [x] zapamiętywać nazwę klasy, której dotyczy event myszy w obsluzMouseDown
- [x] zaprojektować wygląd bloku zajęć

# 13.09.2025
- [x] przekazywać parametry ono modalnego w postaci obiektu (jest ich już za dużo)
- [x] rozbudować sposób przechowywania danych - obiekt dane: {nazwa: {tytul, rekordy: {}, wolne_id}}
- [x] umożliwić kasowanie rekordów
- [x] wyodrębnić metody tworzącą blok zajęć i aktualizującą blok zajęć - wywoływać je odpowiednio dla nowych i istniejących rekordów

# 15.09.2025
- [x] w trakcie tworzenia aktualizować czas w bloku zajęć - te dane będą później służyły do zapisania zajęć
- [x] adresować kliknięcia na atrybutach bloku zajęć do bloku zajęć - otwierać okno edycji
- [x] wyłączać styl kursor grabbing po przeciągnięciu bloku zajęć
- [ ] rozwiązać sposób prezentacji dla treści, która się nie mieści w bloku zajęć
- [ ] umożliwić przeciąganie zajęć pomiędzy dniami
- [x] uniemożliwić zmniejszanie czasu zajęć poniżej zera w wyniku przeciągania uchwytów
- [x] usunąć uchwyt górny

# 16.09.2025
- [x] przy przeciąganiu zawsze obliczać aktualne położenie i długość zajęć bazując na wartościach pierwotnych i delcie
- [x] wyodrębnić ustalanie początku, końca i wysokości zajęć do niezależnych metod - mają cały czas dostęp do this.stan_kursora, wystarczy przekazać clientY
- [x] przy przekierowaniu mouseDown z dzieci na blok zajęć prawidłowo odczytywać y
- [x] dla select bez atrybutu wymóg generować dodatkowo pustą opcję

# 17.09.2025
- [x] dodać przycisk usuń w oknie edycji i metodę obsługującą w kontrolerze
- [x] zmienić nazwę menadżer na kontroler
- [ ] zwiększyć wysokość kalendarza - nie mieści się opis zajęć
- [ ] wraz z usunięciem ucznia i przedmiotu usuwać również zajęcia
- [ ] wraz z usunieciem lokalizacji i nauczyciela usuwać opisy w blokaczh zajęć i ustawiać atrybutych nauczyciel i lokalizacja na null
- [ ] zmienić nazwę danch lokalizacje na miejsca i atrybutów zajeć lokalizacja na miejsce
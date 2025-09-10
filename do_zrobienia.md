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
- [ ] skok przesuwania co 5 minut (5 pixeli)
- [ ] blokada możliwości przesuwania poza zakres kalendarza
- [ ] gripy do przeciągania góry i dołu zajęcia
- [ ] wskazywanie czasu początku i końca zajęcia
- [ ] przywrócić możliwość edycji po kliknięciu na blok zajęć
- [x] odczytywać dane z pliku

# 9.09.2025
- [ ] usuwać z widoku zajęcia po wczytaniu danych z pliku
- [ ] rozmieszczać prawidłowo nowe zajęcia po wczytaniu pliku
- [ ] zapewnić integralność id danych po zapisie i wczytaniu pliku
- [x] wyseparować nauczycieli do osobnego obiektu (ten sam przedmiot mogą prowadzić rózni nauczyciele)
- [x] dodać lokalizację (sala, miejsce itp.)
- [x] indeksy rekordów zaczynać od 1 - ułatwi ew. późniejszy zapis do db - najprościej zainicjować tablice wartością i usunąć ją

# 10.09.2025
- [ ] rozwiązać poprawne rozróżnianie akcji edycji od akcji przeciągania - flagę przeciągania ustawiać dopiwro w evencie move
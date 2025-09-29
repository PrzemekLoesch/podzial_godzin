<?php

// rozkoduj dane zapytania przesłane w json metodą POST
$dane_post = json_decode(file_get_contents('php://input'), true);

// jeśli ustawiono flagę zapisu lub pobrania danych
if ($dane_post['zapisz'] || $dane_post['pobierz']) {

    // parametry połączenia z db
    $host = "mysql8";
    $baza_danych = "40046390_podzial_godzin";
    $uzytkownik = "40046390_podzial_godzin";
    $haslo = "Lwowska60/2";

    // spróbuj połączyć
    try {
        $conn = new PDO("mysql:host=$host;dbname=$baza_danych", $uzytkownik, $haslo);
        // set the PDO error mode to exception
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $status_db = true;

        // zapisanie danych - nowy podział godzin lub akatualizacja istniejącego
        if ($dane_post['zapisz']) {

            // aktualizacja istniejacego podziału godzin
            if ($dane_post['klucz']) {
                $sql = "UPDATE podzialy_godzin SET dane='{$dane_post['dane']}', data_edycji=NOW() WHERE klucz='{$dane_post['klucz']}'";
                $wynik = $conn->query($sql);
            }

            // zapisanie nowego podziału godzin
            else {
                $klucz = bin2hex(random_bytes(3));
                $sql = "INSERT INTO podzialy_godzin (dane, klucz, data_utworzenia, data_edycji) VALUES('{$dane_post['dane']}', '{$klucz}', NOW(), NOW())";
                $wynik = $conn->query($sql);
            }
        }

        // odczytanie podziału godzin
        else {
            $sql = "SELECT * FROM podzialy_godzin WHERE klucz='{$dane_post['klucz']}'";
            $stmt = $conn->query($sql);
            $dane = $stmt->fetch();
        }
    }
    
    // jeśli się nie udało
    catch (PDOException $e) {
        $status_db = false;
        $blad_db = $e->getMessage();
    }

    // zamknij połączenie
    $conn = null;
}

// nagłówek odpowiedzi
header('Content-Type: application/json');

// wyślij opdowiedź
echo json_encode(array(
    "status_db" => $status_db,
    "blad_db" => $blad_db,
    "dane" => $dane['dane'],
    "klucz" => $klucz
));

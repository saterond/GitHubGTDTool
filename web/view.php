<?php
$page = isset($_GET["page"]) ? $_GET["page"] : "home";

if (!file_exists("includes/" . $page . ".html")) {
	$page = "404";
}

$content = file_get_contents("includes/" . $page . ".html");
$title = "";
$desc = "";
switch ($page) {
	case "home":
		$title = "Vývojářský úkolovník";
		$desc = "";
		break;
	case "download":
		$title = "Stažení | GTD Tool";
		$desc = "";
		break;
	case "motivace":
		$title = "Motivace | GTD Tool";
		$desc = "";
		break;
	case "analyza":
		$title = "Analýza | GTD Tool";
		$desc = "";
		break;
	case "architektura":
		$title = "Architektura | GTD Tool";
		$desc = "";
		break;
	case "nasazeni":
		$title = "Nasazení | GTD Tool";
		$desc = "";
		break;
	case "testovani":
		$title = "Testování | GTD Tool";
		$desc = "";
		break;
	case "shrnuti":
		$title = "Shrnutí | GTD Tool";
		$desc = "";
		break;
	case "404":
		$title = "Stránka neexistuje";
		$desc = "Požadovaná stránka neexistuje";
		break;
}

$keys = str_replace(" ", ",", $desc);
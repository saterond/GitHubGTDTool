<?php require_once "view.php"; ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<!--
Design by Free CSS Templates
http://www.freecsstemplates.org
Released for free under a Creative Commons Attribution 2.5 License
-->
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="keywords" content="<?php echo $keys ?>" />
<meta name="description" content="<?php echo $desc ?>" />
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title><?php echo $title ?></title>
<link href="http://fonts.googleapis.com/css?family=Oswald" rel="stylesheet" type="text/css" />
<link href='http://fonts.googleapis.com/css?family=Arvo' rel='stylesheet' type='text/css'>
<link href="style.css" rel="stylesheet" type="text/css" media="screen" />
</head>
<body>
<div id="wrapper">
	<div id="header-wrapper">
		<div id="header">
			<div id="logo">
				<h1><a href="index.html">GTD Tool</a></h1>
				<p>vývojářský úkolovník</p>
			</div>
		</div>
	</div>
	<!-- end #header -->
	<div id="menu-wrapper">
		<div id="menu">
			<ul>
				<li<?php if ($page == "home") echo ' class="current_page_item"'; ?>><a href=".">Home</a></li>
				<li><a href="https://github.com/saterond/GitHubGTDTool">GitHub</a></li>
				<li<?php if ($page == "download") echo ' class="current_page_item"'; ?>><a href="?page=download">Download</a></li>
			</ul>
		</div>
	</div>
	<!-- end #menu -->
	<div id="page">
		<div id="page-bgtop">
			<div id="page-bgbtm">
				<div id="page-content">
					<div id="content">
					<?php echo $content ?>
					</div>
					<!-- end #content -->
					<div id="sidebar">
						<ul>
						<?php if ($page == "home" || $page == "404") { ?>
							<li>
								<h2>Abstrakt</h2>
								<p>Obsahem této práce je vytvoření nástroje pro vývojáře, který umožní správu úkolů z různých služeb. Nástroj je postavený na platformě Titanium. Cílem aplikace je usnadnit uživateli práci s úkoly z různých zdrojů/služeb.</p>
							</li>
						<?php } ?>
							<li>
								<h2>Kapitoly</h2>
								<ul>
									<li><a href=".">Úvod</a></li>
									<li><a href="?page=motivace">Motivace</a></li>
									<li><a href="?page=analyza">Analýza</a></li>
									<li><a href="?page=architektura">Architektura</a></li>
									<li><a href="?page=nasazeni">Nasazení</a></li>
									<li><a href="?page=testovani">Testování</a></li>
									<li><a href="?page=shrnuti">Shrnutí</a></li>
								</ul>
							</li>
						</ul>
					</div>
					<!-- end #sidebar -->
				</div>
				<div style="clear: both;">&nbsp;</div>
			</div>
		</div>
	</div>
	<!-- end #page -->
</div>
<div id="footer">
	<p>Copyright (c) 2012 GTDTool.satera.cz All rights reserved. Design by <a href="http://www.freecsstemplates.org/"> CSS Templates</a>.</p>
</div>
<!-- end #footer -->
</body>
</html>
<?php

if (! isset($_GET['id']))
  die("id not set");

header("Content-Type: application/json");
die(file_get_contents("https://character-service.dndbeyond.com/character/v5/character/" . $_GET['id']));

// EOF

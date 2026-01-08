Mini script pour calculer la direction et la progression des marées venant de mathmut

// Process dynamic data
$direction = ($nextEvent) ? ($nextEvent['extreme_type'] === TidesModel::EXTREME_TYPE_LOW ? 'DOWN' : 'UP') : null;

if ($previousEvent && $nextEvent) {
    $totalDuration = $nextEvent['timestamp'] - $previousEvent['timestamp'];
    $elapsedTime = $currentTimestamp - $previousEvent['timestamp'];
    $progression = floor($elapsedTime / $totalDuration * 100);
}


Pour la version ipad on va avoir un ecran 0 avec un code de region a entrée qui permet de 
savoir quel api aller tape
Tadoussac
xxx

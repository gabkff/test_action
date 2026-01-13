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


POUR LA METEO 
:coche_blanche: Soleil => 0 ;
:coche_blanche: Soleil + Nuage => 1, 2 ;
:coche_blanche: Soleil + Nuage + Pluie => 51
:coche_blanche: Nuage => 3
:coche_blanche: Nuage + Pluie => 5*, 6*, 8*
:coche_blanche: Orage => 95
:coche_blanche: Orage + Pluie => <96
Manquerait :
:x: 4* => Fog ;
:x: 7* => Snow ;
À mon sens, freezing rain, freezing drizzle, snow grain.. ça peut tomber dans pluie et neige, fak on serait correct avec c'est deux-là qui manquent (je laisse à Nana/jm le dernier mot tho)
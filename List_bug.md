Liste bug :
    // Faut viré l'état actif des boutons (Ils sont grisés)
    // Google map ne monte pas sur la prod. 
    reduire la margin 
    // SidePanel souvre ferme trop facilement il faut bloquer pour un temps defini
    Map doit follow + zoom en fonction de l'étape
    Arrêt suivanmt et précédent on pourrait mettre ça dans le sidepanel
    Limité le nombre de caractères pour le maint_text
    Ajout d'un bouton pour recentrer le circuit. 
    //Fleche de swip pour image dans sidepanel toujours la meme si pas besoin
    Bouton circuit en fin de nav inaccessible
    //les step current ne se reset pas
    les jours ont pas la même longueur en english

    FEEDBACK LORS DU TOUCH sur les boutons.
    Peut être juste contour fiar
    ***********************************************************************
    RETOUR SIMON A PARTIR DICI LE PLUS IMPORTANT ICI LALALAALALA
    ALIGNER AVEC LE BOUTON CIRCUIT LE BLOC DE TEXT
    On va viré les bouton d'étapes dans les steps

    Le selector a le style de bouton big

    Toujours le même style pour le mode liste (plus de différences entrer etape 1 et autre)

    Pour la map on va pas la centrer mais la mettre en haut du bloc. (revoir systeme center() et bind(latlong))

    Categorie icone / nombre arrêt LE HEADER A CHANGÉ POUR L'ÉTAPE EN COURS

    On va centrer la map sur le point qui nous intéresse on s'en fout du zoom 
    Tout en gardant en tête que on l'affiche en haut du container

    SIDEPANEL ETAPE
        ON A 2 sticky et un gros scroll
            Info titre 
            CODE QR
            (On va viré la hauteur fix sur la partie scroll_text pour avoir une hauteur fixe sur le sidepanl)

    Bouton pour shrink le panel avec le texte et tout 
    Le switch de meteo doit faire bouger de 2 et pas de 1
    

Nice to have 


On a pas la clef api de client pour google map
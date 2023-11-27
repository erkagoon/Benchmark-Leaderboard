require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 8080;
const { parse, toHTML, toPlainText } = require('@altrd/mpformat')
const mapBronze = ['OV3Jj9DyWfEXF3b8eE8IUi1H0_0_benchmark', '5yF8Cze4zJF4QasxsbzppEgW8L1_benchmark', 'oRiNhlUaqI4cdIekBXZtHZFNZZf_benchmark', 'ak_I4mg0AGeR4dQ5JLI_pli_zC1_benchmark', 'vBWGGaTxrTo2Hrj0EZ9IidxDFLb_benchmark', 'toIu64S2pWdT6VioAPloXwAgLEi_benchmark'];
const mapSilver = ['FZl0xyN41ttgmJrf61XKDFwCIpd_benchmark', 'BkoB85WN0PDQ7O9r20NMrRL3A6f_benchmark', 'A8EPXDpshYfqUh3xW7gM_JxjgSg_benchmark', 'diVZEB5eGowZvmK1LgiM27VTL54_benchmark', 'D2sMRq545lxBPYtJIjbFzxgjHS3_benchmark', 'kXHQ22wm00yBIckLT0NihmC8OB9_benchmark'];
const mapGold = ['Y7W8owGSb9Qj1w0fY6f_q8vmbKb_benchmark', '66rEYKLZ2Og7rWC9IOOdLk8LKyb_benchmark', '2Dbt3c0NsC_eUmQmEc_1n3lpfih_benchmark', 'x_0rohnl9NZ4UzhjrYJ0m1tGHNl_benchmark', 'j81BhKTVB5FnkvEihcZ9FaGo6Z2_benchmark', 'SgLOMWNgxSwtlox9lPYyzCQjTr_benchmark'];
const mapPlatinum = ['J17aq60rmfUBQiSzkKiQAQSzyS4_benchmark', 'iojY5_jiskdsRqW0g5adgNhD4i0_benchmark', 'cvvlEaXsSnnmFBOk7dPNwNizf3e_benchmark', '0cn7Shl_s9dyOLFBdlS4k0rgJfd_benchmark', 'ceNhENIxYXEGnJCnoGzXCbxLOJm_benchmark', 'v_bWZ2TqJtUgIZgRuD7PpI_ql7h_benchmark'];
const mapDiamond = ['yKUzyJRnqqt6SbykrWfvDzmtePh_benchmark', 'a10vM3RvKvsSKouW8vitdKoUjWh_benchmark', 'ExF_FL4GddMmmp4U2JVOGVq77bb_benchmark', '0VNtkbYbjlUTDR2x5uP2_L6HwBh_benchmark', '79dDAyxs4OWv9j34jFvF0vKPGa_benchmark', '6drs2qo4UyiOCUSmYSI6r76EhA8_benchmark'];
const mapMaster = ['tfCRch0b7oPGIsjg2IrwjKn1_Zi_benchmark', 'BJqxdSPcVE7xLWpaMBpHsXc44Lh_benchmark', 'To8pnvm5y1nYxOjHTclHEVe8ml8_benchmark', 'tl2zP4OMMeMAhYYEf9_oYhnKK1b_benchmark', 'sK2ZRYJna8F873kLG8g3_0ZR4Km_benchmark', 'Pn4LO9YeQlGwU409uOfN3X0clfh_benchmark'];
const mapGrandmaster = ['iWa4rDZUqP6RG1maeuJx4_6D8Vi_benchmark', 'Lb_TvFROKkpXvv8xig2O_FA2yD3_benchmark', 'Pis7xMCAV1943rysUG0_WryxLx9_benchmark', 'q7SnC7eJeubTHtifMRXfLCp3CN1_benchmark', 'b9LhhBN7_OCNUaiAzzhQb7u4Ns4_benchmark', 'k8pnz4nrME6CuBRWvk2THdlSMrl_benchmark'];

let allMaps = [];

function convertTimestampToTime(timestamp) {
    let seconds = Math.floor(timestamp / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds %= 60;
    minutes %= 60;

    // Formater en chaîne de caractères
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getCategory(mapsId) {
    // Vérifier si le joueur n'a pas terminé toutes les cartes du rang le plus bas (Bronze)
    if (mapBronze.some(id => mapsId.includes(id))) {
        return 'Unranked';
    } 
    // Vérifier si le joueur n'a pas terminé toutes les cartes du rang Silver
    else if (mapSilver.some(id => mapsId.includes(id))) {
        return 'Bronze';
    } 
    // Et ainsi de suite pour les autres rangs
    else if (mapGold.some(id => mapsId.includes(id))) {
        return 'Silver';
    } 
    else if (mapPlatinum.some(id => mapsId.includes(id))) {
        return 'Gold';
    } 
    else if (mapDiamond.some(id => mapsId.includes(id))) {
        return 'Platinum';
    } 
    else if (mapMaster.some(id => mapsId.includes(id))) {
        return 'Diamond';
    } 
    else if (mapGrandmaster.some(id => mapsId.includes(id))) {
        return 'Master';
    } 
    // Si toutes les cartes des rangs sont terminées
    else {
        return 'Grandmaster';
    }
}


async function getMapNameById(mapId) {
    try {
        const response = await axios.post('https://obstacle.titlepack.io/api/graphql', {
            query: `{
                map(gameId: "${mapId}") {
                    name
                }
            }`
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        return response.data.data.map.name;
    } catch (error) {
        console.error('Erreur lors de la récupération du nom de la carte :', error);
        return null;
    }
}

function removeAnchorTags(inputString) {
    return inputString.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1");
}

app.use(express.json());
app.use(express.static('public'));

// Configurer le dossier de vues et le moteur de template
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    res.render('index', { title: 'Benchmark Leaderboard' });
});

app.get('/classement', async (req, res) => {
    try {
        const response = await axios.post('https://obstacle.titlepack.io/api/graphql', {
            query: `{
                mappack(mappackId: "39") {
                  maps {
                    map
                    mapId
                  }
                }
              }`
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const maps = response.data.data.mappack.maps;

        // Créer un tableau de promesses pour les requêtes imbriquées
        const mapDetailsPromises = maps.map(async map => {
            try {
                const mapResponse = await axios.post('https://obstacle.titlepack.io/api/graphql', {
                    query: `{
                        map(gameId: "${map.mapId}") {
                          name
                          gameId
                          player {
                            login
                            name
                          }
                          records {
                            rank
                            time
                            recordDate
                            player {
                              login
                              name
                            }
                          }
                        }
                      }`
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
        
                // Vérifiez si `data` et `map` sont présents
                if (mapResponse.data && mapResponse.data.data && mapResponse.data.data.map) {
                    return mapResponse.data.data.map;
                } else {
                    throw new Error('La réponse ne contient pas les données attendues');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des détails de la carte :', error);
                // Retournez `null` ou une autre valeur appropriée qui indiquera une erreur lors du traitement de cette carte
                return null;
            }
        });
        

        // Attendre que toutes les promesses soient résolues
        const mapsDetails = await Promise.all(mapDetailsPromises);
        const peoples = {};
        let i = 0;

        mapsDetails.forEach(mapDetail => {
            allMaps.push({
                mapName: removeAnchorTags(toHTML(parse(mapDetail.name))),
                mapId: mapDetail.gameId,
            });
        });

        mapsDetails.forEach(mapDetail => {

            mapDetail.records.forEach(record => {
                const playerLogin = record.player.login;
                const playerName = record.player.name;
                const mapId = mapDetail.gameId;
                if (!peoples[playerLogin]) {
                    peoples[playerLogin] = {
                        name: removeAnchorTags(toHTML(parse(playerName))),
                        time: 0,
                        mapNocomp: allMaps.slice() // Initialisez avec toutes les cartes
                    };
                }
        
                peoples[playerLogin].time += record.time;
                
                // Mettez à jour mapNocomp pour ce joueur
                const mapNoCompIndex = peoples[playerLogin].mapNocomp.findIndex(mapObj => mapObj.mapId === mapId);
                if (mapNoCompIndex > -1) {
                    peoples[playerLogin].mapNocomp.splice(mapNoCompIndex, 1);
                }
            });
        });

        // Conversion de l'objet peoples en tableau
        let peoplesArray = Object.entries(peoples).map(([login, data]) => {
            const mapIds = data.mapNocomp.map(mapObj => mapObj.mapId);
            const numberMapFinished = allMaps.length - mapIds.length;
            const rank = getCategory(mapIds);
            
            return {
                login,
                rank: rank,
                name: data.name,
                time: data.time,
                close: numberMapFinished,
                maps: data.mapNocomp
            };
        });

        // Tri du tableau
        peoplesArray.sort((a, b) => {
            if (a.close !== b.close) {
                return b.close - a.close;
            }
            return a.time - b.time;
        });

        peoplesArray = peoplesArray.map(people => {
            return {
                ...people,
                time: convertTimestampToTime(people.time)
            };
        });

        allMaps = [];

        // Rendre la réponse avec les détails de toutes les maps
        res.json({ peoples: peoplesArray });

    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        res.status(500).send('Erreur interne du serveur');
    }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
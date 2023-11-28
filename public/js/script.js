document.addEventListener('DOMContentLoaded', function() {
    fetch('/classement')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            return response.json();
        })
        .then(data => { 
            const peoples = data.peoples;
            function createTableWithData(peoples) {
                const tableBody = document.createElement('tbody');
            
                peoples.forEach((people, index) => {
                    const tr = document.createElement('tr');
            
                    // Colonne Rank
                    const tdRank = document.createElement('td');
                    tdRank.className = 'tdRank';
                    tdRank.textContent = index + 1;
                    tr.appendChild(tdRank);
            
                    // Colonne Name
                    const tdName = document.createElement('td');
                    tdName.innerHTML = `${people.name} (${people.rank})`;
                    tr.appendChild(tdName);
            
                    // Colonne Time
                    const tdTime = document.createElement('td');
                    tdTime.className = 'tdTime';
                    tdTime.textContent = people.time;
                    tr.appendChild(tdTime);
            
                    // Colonne Number of Maps Completed
                    const tdClose = document.createElement('td');
                    tdClose.className = 'tdClose';
                    tdClose.textContent = `${people.close}/42`;
                    tr.appendChild(tdClose);
            
                    // Colonne Unfinished map
                    const tdMaps = document.createElement('td');
                    tdMaps.className = 'tdUmap';
                    tdMaps.className = 'maps';
                    
                    const spanFirstMap = document.createElement('span');
                    spanFirstMap.className = 'first-map';
                    spanFirstMap.textContent = 'Click to expand';
                    tdMaps.appendChild(spanFirstMap);
            
                    const divMapsContent = document.createElement('div');
                    divMapsContent.className = 'maps-content';
                    divMapsContent.style.display = 'none';
                    divMapsContent.dataset.index = index;
            
                    if (people.maps.length > 0) {
                        const mapsByRank = people.maps.reduce((acc, map) => {
                            acc[map.mapRank] = acc[map.mapRank] || [];
                            acc[map.mapRank].push(map);
                            return acc;
                        }, {});
                    
                        // Définir l'ordre des rangs
                        const rankOrder = ['grandmaster', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'];

                        // Trier et ajouter les éléments de liste pour chaque rang selon l'ordre défini
                        rankOrder.forEach(rank => {
                            if (mapsByRank[rank] && mapsByRank[rank].length > 0) {
                                const ulMap = document.createElement('ul');
                                ulMap.className = 'maps-list';
                    
                                // Créer un élément span pour le titre du rang
                                const spanRankTitle = document.createElement('span');
                                spanRankTitle.className = 'rank-title';
                                spanRankTitle.textContent = rank.charAt(0).toUpperCase() + rank.slice(1); // Capitalize the rank
                                ulMap.appendChild(spanRankTitle);
                    
                                // Ajouter les maps pour le rang courant
                                mapsByRank[rank].forEach(map => {
                                    const liMap = document.createElement('li');
                                    liMap.className = 'map-name';
                                    liMap.innerHTML = map.mapName; // Assurez-vous que le contenu de map.mapName est sécurisé
                                    ulMap.appendChild(liMap);
                                });
                    
                                divMapsContent.appendChild(ulMap);
                            }
                        });
                    } else {
                        const liCompleted = document.createElement('li');
                        liCompleted.textContent = 'All maps are completed';
                        divMapsContent.appendChild(liCompleted);
                    }                                      
                    
            
                    tdMaps.appendChild(divMapsContent);
                    tr.appendChild(tdMaps);
            
                    tableBody.appendChild(tr);
                });
            
                return tableBody;
            }
            
            const table = document.querySelector('.classement');
            const newTableBody = createTableWithData(peoples);
            table.appendChild(newTableBody);
            
            document.querySelectorAll('tbody tr').forEach(function(row) {
                row.addEventListener('click', function() {
                    var index = Array.from(row.parentNode.children).indexOf(row);
                    var content = document.querySelector('.maps-content[data-index="' + index + '"]');
                    var firstMap = row.querySelector('.first-map');
                    
                    var isHidden = content.style.display === 'none' || content.style.display === '';
        
                    if (isHidden) {
                        content.style.display = 'block';
                        firstMap.style.display = 'none';
                    } else {
                        content.style.display = 'none';
                        firstMap.style.display = 'inline';
                    }
                });
            });

            const loader = document.getElementById('loader');
            const spanLoader = document.getElementById('spanLoader');
            loader.remove();
            spanLoader.remove();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
        });
});

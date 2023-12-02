document.addEventListener('DOMContentLoaded', function() {
    const sortState = {};
    const tierOrder = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];

    function convertTimeToSeconds(time) {
        const parts = time.split(':');
        let seconds = 0;
        if (parts.length === 3) {
            seconds += parseInt(parts[0]) * 3600; 
            seconds += parseInt(parts[1]) * 60;   
            seconds += parseInt(parts[2]);
        }
        return seconds;
    }

    function determineColorTier(tier) {
        if (tier==='Bronze') return '#cd7f32';
        if (tier==='Silver') return '#c0c0c0';
        if (tier==='Gold') return '#ffd700';
        if (tier==='Platinum') return '#b0c4de';
        if (tier==='Diamond') return '#b9f2ff';
        if (tier==='Master') return '#aa00ff';
        if (tier==='Grandmaster') return '#ff0000';
        return 'grey';
    }

    function sortTable(columnIndex, numeric, special = null) {
        const table = document.querySelector('.classement');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
    
        // Déterminer la direction du tri
        if (sortState[columnIndex] === 'ascending') {
            sortState[columnIndex] = 'descending';
        } else {
            sortState[columnIndex] = 'ascending';
        }
    
        rows.sort((rowA, rowB) => {
            let cellA = rowA.querySelectorAll('td')[columnIndex].textContent.trim();
            let cellB = rowB.querySelectorAll('td')[columnIndex].textContent.trim();
    
            if (special === 'time') {
                cellA = convertTimeToSeconds(cellA);
                cellB = convertTimeToSeconds(cellB);
            } else if (special === 'maps') {
                cellA = parseInt(cellA.split('/')[0]);
                cellB = parseInt(cellB.split('/')[0]);
            } else if (special === 'tier') {
                cellA = tierOrder.indexOf(cellA);
                cellB = tierOrder.indexOf(cellB);
            } else if (numeric) {
                cellA = parseFloat(cellA);
                cellB = parseFloat(cellB);
            }
    
            if (numeric || special) {
                return sortState[columnIndex] === 'ascending' ? cellA - cellB : cellB - cellA;
            } else {
                return sortState[columnIndex] === 'ascending' ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
            }
        });
    
        // Ajouter les lignes triées au tbody
        rows.forEach(row => tbody.appendChild(row));
    }

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
                    tdName.innerHTML = `${people.name}`;
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

                        const rankOrder = ['grandmaster', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'];

                        rankOrder.forEach(rank => {
                            if (mapsByRank[rank] && mapsByRank[rank].length > 0) {
                                const ulMap = document.createElement('ul');
                                ulMap.className = 'maps-list';
                    
                                const spanRankTitle = document.createElement('span');
                                spanRankTitle.className = 'rank-title';
                                spanRankTitle.textContent = rank.charAt(0).toUpperCase() + rank.slice(1);
                                ulMap.appendChild(spanRankTitle);
                    
                                mapsByRank[rank].forEach(map => {
                                    const liMap = document.createElement('li');
                                    liMap.className = 'map-name';
                                    liMap.innerHTML = map.mapName;
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
            
                    // Colonne tier
                    const tdThier = document.createElement('td');
                    tdThier.className = 'tdThier';
                    tdThier.textContent = `${people.rank}`;
                    tdThier.style = `color: ${determineColorTier(people.rank)}`;
                    tr.appendChild(tdThier);
                    
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

            // Ajouter un écouteur d'événements à chaque en-tête de colonne
            const headers = document.querySelectorAll('.classement thead th');
            headers.forEach((header, index) => {
                header.addEventListener('click', () => {
                    const isNumeric = header.classList.contains('thRank');
                    const isMaps = header.classList.contains('thClose');
                    const isTier = header.classList.contains('thTier');
                    const isName = header.classList.contains('thName');
                    const isTime = header.classList.contains('thTime');
                    sortTable(index, isNumeric, isMaps ? 'maps' : isTier ? 'tier' : isTime ? 'time' : isName ? null : null);
                });
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
        });
});

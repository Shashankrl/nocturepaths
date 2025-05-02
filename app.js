// Initialize map
const map = L.map('map').setView([12.9716, 77.5946], 12); // Centered on Bangalore

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store markers and polylines
const markers = {};
const polylines = {};
let currentPath = null;

// Custom marker icons
const defaultIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const visitedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const pathIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Initialize markers and polylines
function initializeMap() {
    // Create markers for all nodes
    getAllNodeNames().forEach(nodeName => {
        const coords = getNodeCoordinates(nodeName);
        const marker = L.marker([coords.lat, coords.lng], {
            icon: defaultIcon
        }).addTo(map);
        
        marker.bindPopup(nodeName);
        markers[nodeName] = marker;
    });
    
    // Create polylines for all edges
    getAllNodeNames().forEach(fromNode => {
        getNeighbors(fromNode).forEach(toNode => {
            if (fromNode < toNode) { // Avoid duplicate edges
                const fromCoords = getNodeCoordinates(fromNode);
                const toCoords = getNodeCoordinates(toNode);
                
                const polyline = L.polyline(
                    [[fromCoords.lat, fromCoords.lng], [toCoords.lat, toCoords.lng]],
                    { color: '#666', weight: 2 }
                ).addTo(map);
                
                const key = `${fromNode}-${toNode}`;
                polylines[key] = polyline;
            }
        });
    });
}

// Populate dropdowns
function populateDropdowns() {
    const startSelect = document.getElementById('startNode');
    const endSelect = document.getElementById('endNode');
    
    getAllNodeNames().forEach(nodeName => {
        startSelect.add(new Option(nodeName, nodeName));
        endSelect.add(new Option(nodeName, nodeName));
    });
}

// Reset the map visualization
function resetMap() {
    // Reset markers
    Object.values(markers).forEach(marker => {
        marker.setIcon(defaultIcon);
    });
    
    // Reset polylines
    Object.values(polylines).forEach(polyline => {
        polyline.setStyle({
            color: '#666',
            weight: 2
        });
    });
    
    // Remove current path
    if (currentPath) {
        map.removeLayer(currentPath);
        currentPath = null;
    }
    
    // Reset distance display
    document.getElementById('totalDistance').textContent = '-';
    
    // Reset path summary
    document.getElementById('pathExplanation').textContent = 'Select start and end locations to find the shortest path.';
    document.getElementById('nodesVisited').textContent = '-';
    document.getElementById('pathLength').textContent = '-';
}

// Animate marker icon change
function animateMarkerIcon(marker, newIcon, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            marker.setIcon(newIcon);
            resolve();
        }, delay);
    });
}

// Generate path explanation
function generatePathExplanation(result) {
    const startNode = result.path[0];
    const endNode = result.path[result.path.length - 1];
    const totalDistance = result.distance;
    const visitedCount = result.visited.length;
    const pathLength = result.path.length;

    // Get all possible direct paths from start to end
    const directPaths = [];
    getAllNodeNames().forEach(node => {
        if (node !== startNode && node !== endNode) {
            const path1 = getDistance(startNode, node);
            const path2 = getDistance(node, endNode);
            if (path1 !== Infinity && path2 !== Infinity) {
                directPaths.push({
                    node: node,
                    distance: path1 + path2
                });
            }
        }
    });

    // Sort direct paths by distance
    directPaths.sort((a, b) => a.distance - b.distance);

    let explanation = `The algorithm found the shortest path from ${startNode} to ${endNode} `;
    explanation += `by exploring ${visitedCount} locations. `;
    
    if (pathLength > 2) {
        explanation += `The path goes through ${pathLength - 2} intermediate locations: `;
        explanation += result.path.slice(1, -1).join(' → ') + '. ';
    }
    
    explanation += `The total distance is ${totalDistance.toFixed(1)} km, which is the shortest possible path between these locations.\n\n`;

    // Explain why other routes weren't chosen
    if (directPaths.length > 0) {
        explanation += `Alternative routes that were considered but not chosen:\n`;
        directPaths.forEach((path, index) => {
            if (path.distance > totalDistance) {
                explanation += `• Going through ${path.node} would be ${(path.distance - totalDistance).toFixed(1)} km longer `;
                explanation += `(total: ${path.distance.toFixed(1)} km)\n`;
            }
        });
    }

    // Explain the algorithm's decision process
    explanation += `\nThe algorithm chose this path because:\n`;
    explanation += `1. It explores all possible routes systematically\n`;
    explanation += `2. It always picks the shortest known path to explore next\n`;
    explanation += `3. It stops when it finds the destination, ensuring the path is optimal\n`;
    
    if (result.visited.length < getAllNodeNames().length) {
        explanation += `4. It didn't need to explore all locations because it found the optimal path early\n`;
    }

    return explanation;
}

// Create flowing path animation
function createFlowingPath(path) {
    if (currentPath) {
        map.removeLayer(currentPath);
    }

    const pathCoordinates = [];
    for (let i = 0; i < path.length - 1; i++) {
        const fromNode = path[i];
        const toNode = path[i + 1];
        const fromCoords = getNodeCoordinates(fromNode);
        const toCoords = getNodeCoordinates(toNode);
        pathCoordinates.push([fromCoords.lat, fromCoords.lng]);
        if (i === path.length - 2) {
            pathCoordinates.push([toCoords.lat, toCoords.lng]);
        }
    }

    currentPath = L.polyline(pathCoordinates, {
        color: '#F44336',
        weight: 4,
        dashArray: '10, 10',
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(map);

    // Add flowing animation
    let offset = 0;
    const animate = () => {
        offset = (offset + 1) % 20;
        currentPath.setStyle({
            dashOffset: -offset
        });
        requestAnimationFrame(animate);
    };
    animate();
}

// Visualize the path with animations
async function visualizePath(result) {
    // Reset the map first
    resetMap();
    
    // Disable buttons during animation
    const findPathBtn = document.getElementById('findPath');
    const resetBtn = document.getElementById('reset');
    findPathBtn.disabled = true;
    resetBtn.disabled = true;
    
    // Animate visited nodes
    for (const node of result.visited) {
        await animateMarkerIcon(markers[node], visitedIcon, 300);
    }
    
    // Animate the final path
    for (let i = 0; i < result.path.length - 1; i++) {
        const fromNode = result.path[i];
        const toNode = result.path[i + 1];
        
        // Animate nodes in the path
        await animateMarkerIcon(markers[fromNode], pathIcon, 300);
        await animateMarkerIcon(markers[toNode], pathIcon, 300);
    }
    
    // Create flowing path animation
    createFlowingPath(result.path);
    
    // Update path summary
    const explanation = generatePathExplanation(result);
    document.getElementById('pathExplanation').innerHTML = explanation.split('\n').map(line => 
        line.startsWith('•') || line.startsWith('1.') || line.startsWith('2.') || 
        line.startsWith('3.') || line.startsWith('4.') ? 
        `<div class="explanation-line">${line}</div>` : 
        `<div>${line}</div>`
    ).join('');
    document.getElementById('nodesVisited').textContent = result.visited.length;
    document.getElementById('pathLength').textContent = result.path.length;
    
    // Update distance display with animation
    const distanceElement = document.getElementById('totalDistance');
    distanceElement.style.opacity = '0';
    setTimeout(() => {
        distanceElement.textContent = result.distance === Infinity ? 'No path found' : result.distance.toFixed(1);
        distanceElement.style.opacity = '1';
    }, 300);
    
    // Re-enable buttons
    findPathBtn.disabled = false;
    resetBtn.disabled = false;
}

// Event Listeners
document.getElementById('findPath').addEventListener('click', () => {
    const startNode = document.getElementById('startNode').value;
    const endNode = document.getElementById('endNode').value;
    
    if (startNode && endNode) {
        const result = dijkstra(startNode, endNode);
        visualizePath(result);
    }
});

document.getElementById('reset').addEventListener('click', resetMap);

// Initialize the application
initializeMap();
populateDropdowns(); 
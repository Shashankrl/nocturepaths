// Graph data structure for Bangalore locations
const graphData = {
    nodes: {
        'MG Road': { lat: 12.9757, lng: 77.6011 },
        'Indiranagar': { lat: 12.9784, lng: 77.6408 },
        'Koramangala': { lat: 12.9279, lng: 77.6271 },
        'Whitefield': { lat: 12.9698, lng: 77.7499 },
        'Electronic City': { lat: 12.8398, lng: 77.6770 },
        'Marathahalli': { lat: 12.9592, lng: 77.6974 },
        'Jayanagar': { lat: 12.9279, lng: 77.5831 },
        'BTM Layout': { lat: 12.9166, lng: 77.6101 }
    },
    
    edges: {
        'MG Road': {
            'Indiranagar': 4.5,
            'Koramangala': 5.2
        },
        'Indiranagar': {
            'MG Road': 4.5,
            'Koramangala': 3.8,
            'Whitefield': 8.2
        },
        'Koramangala': {
            'MG Road': 5.2,
            'Indiranagar': 3.8,
            'BTM Layout': 2.5,
            'Electronic City': 12.0
        },
        'Whitefield': {
            'Indiranagar': 8.2,
            'Marathahalli': 3.5
        },
        'Electronic City': {
            'Koramangala': 12.0,
            'BTM Layout': 10.5
        },
        'Marathahalli': {
            'Whitefield': 3.5,
            'BTM Layout': 4.8
        },
        'Jayanagar': {
            'BTM Layout': 3.2
        },
        'BTM Layout': {
            'Koramangala': 2.5,
            'Marathahalli': 4.8,
            'Jayanagar': 3.2,
            'Electronic City': 10.5
        }
    }
};

// Helper function to get coordinates for a node
function getNodeCoordinates(nodeName) {
    return graphData.nodes[nodeName];
}

// Helper function to get all node names
function getAllNodeNames() {
    return Object.keys(graphData.nodes);
}

// Helper function to get neighbors of a node
function getNeighbors(nodeName) {
    return Object.keys(graphData.edges[nodeName] || {});
}

// Helper function to get distance between two nodes
function getDistance(fromNode, toNode) {
    return graphData.edges[fromNode]?.[toNode] || Infinity;
} 
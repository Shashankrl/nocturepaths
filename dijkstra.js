// Priority Queue implementation
class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(val, priority) {
        this.values.push({ val, priority });
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }

    isEmpty() {
        return this.values.length === 0;
    }
}

// Dijkstra's Algorithm implementation
function dijkstra(startNode, endNode) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const pq = new PriorityQueue();
    
    // Initialize distances
    getAllNodeNames().forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    
    distances[startNode] = 0;
    pq.enqueue(startNode, 0);
    
    while (!pq.isEmpty()) {
        const { val: currentNode } = pq.dequeue();
        
        if (currentNode === endNode) {
            break;
        }
        
        if (visited.has(currentNode)) {
            continue;
        }
        
        visited.add(currentNode);
        
        // Process neighbors
        getNeighbors(currentNode).forEach(neighbor => {
            if (visited.has(neighbor)) {
                return;
            }
            
            const distance = distances[currentNode] + getDistance(currentNode, neighbor);
            
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = currentNode;
                pq.enqueue(neighbor, distance);
            }
        });
    }
    
    // Reconstruct path
    const path = [];
    let current = endNode;
    
    while (current) {
        path.unshift(current);
        current = previous[current];
    }
    
    return {
        path: path,
        distance: distances[endNode],
        visited: Array.from(visited)
    };
} 
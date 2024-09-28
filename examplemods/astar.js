(function AStarPathfinding() {
    ModAPI.meta.title("A* Pathfinding Bot");
    ModAPI.meta.description("Use #move <x> <y> <z> to instruct the bot to move somewhere. Use #stop to terminate the job.");
    ModAPI.meta.credits("By ZXMushroom63");

    ModAPI.require("player");
    ModAPI.require("world");

    var blockBreakCostMultiplier = 2;
    const costMap = Object.fromEntries(Object.keys(ModAPI.blocks).flatMap(x => {
        ModAPI.blocks[x].readableId = x;
        return [x, (Math.floor(ModAPI.blocks[x].blockHardness * 10 * blockBreakCostMultiplier) + 1) || 99999]; //Block hardness is in decimals, unbreakable blocks are negative one, and base movement cost is 1. -1 + 1 = 0, and 0 || 99999 is 99999
    }));

    var makeBlockPos = ModAPI.reflect.getClassById("net.minecraft.util.BlockPos").constructors.find(x=>x.length === 3);

    function shouldPause(x, y, z) {
        return !ModAPI.world.isAreaLoaded0(makeBlockPos(x, y, z), 2);
    }

    class APNode {
        constructor(x, y, z, g, h, parent = null) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.g = g;
            this.h = h;
            this.f = g + h;
            this.parent = parent;
        }
    }
    
    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
    }
    
    function getNeighbors(node) {
        const neighbors = [];
        const directions = [
            [1, 0, 0], [-1, 0, 0],
            [0, 1, 0], [0, -1, 0],
            [0, 0, 1], [0, 0, -1]
        ];
    
        for (const [dx, dy, dz] of directions) {
            const x = node.x + dx;
            const y = node.y + dy;
            const z = node.z + dz;
    
            if (ModAPI.world.isBlockLoaded(makeBlockPos(Math.round(x), Math.round(y), Math.round(z)))) {
                neighbors.push(new APNode(x, y, z, 0, 0));
            }
        }
    
        return neighbors;
    }
    
    function lookupCost(x, y, z) {
        var block = ModAPI.world.getBlockState(makeBlockPos(Math.round(x), Math.round(y), Math.round(z))).block;
        return costMap[block.readableId];
    }
    
    function* aStar(start, goal) {
        const openSet = [];
        const closedSet = new Set();
        openSet.push(start);
    
        while (openSet.length > 0) {
            let current = openSet.reduce((prev, curr) => (prev.f < curr.f ? prev : curr));
    
            if (current.x === goal.x && current.y === goal.y && current.z === goal.z) {
                const path = [];
                while (current) {
                    path.push([current.x, current.y, current.z]);
                    current = current.parent;
                }
                yield* path.reverse();
                return;
            }
    
            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(`${current.x},${current.y},${current.z}`);
    
            for (const neighbor of getNeighbors(current)) {
                if (closedSet.has(`${neighbor.x},${neighbor.y},${neighbor.z}`)) {
                    continue;
                }
    
                const tentativeG = current.g + lookupCost(neighbor.x, neighbor.y, neighbor.z);
    
                if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y && node.z === neighbor.z)) {
                    neighbor.g = tentativeG;
                    neighbor.h = heuristic(neighbor, goal);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                    openSet.push(neighbor);
                } else {
                    const existingNode = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y && node.z === neighbor.z);
                    if (tentativeG < existingNode.g) {
                        existingNode.g = tentativeG;
                        existingNode.f = existingNode.g + existingNode.h;
                        existingNode.parent = current;
                    }
                }
            }
    
            yield [current.x, current.y, current.z];
        }
    
        return [];
    }
    
    const start = new APNode(0, 0, 0, 0, 0);
    const goal = new APNode(2, 2, 2, 0, 0);
    
    const pathGenerator = aStar(start, goal);
})();
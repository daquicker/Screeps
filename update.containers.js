module.exports = function updateContainers() {
    Game.spawns['Spawn1'].room.memory.containerIDs = [];
    Game.spawns['Spawn1'].room.memory.sourceContainerIDs = [];
    Game.spawns['Spawn1'].room.memory.reserveContainerIDs = [];
    let sources = []
    for (let sourceID of Game.spawns['Spawn1'].room.memory.sourceIDs) {
        sources.push(Game.getObjectById(sourceID));
    }
    let containers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
    });
    for (let container of containers) {
        let adjacentSources = container.pos.findInRange(sources, 1);
    // Check if countainer is considered a sourceContainer
        if (adjacentSources.length != 0) {
            Game.spawns['Spawn1'].room.memory.sourceContainerIDs.push(container.id);
            Game.spawns['Spawn1'].room.memory.containerIDs.push(container.id);
        }
            // Container is considered a reserve container
        else {
            Game.spawns['Spawn1'].room.memory.reserveContainerIDs.push(container.id);
            Game.spawns['Spawn1'].room.memory.containerIDs.push(container.id);
        }
    }
};
module.exports = function updateContainers(roomParam) {
    roomParam.memory.containerIDs = [];
    roomParam.memory.sourceContainerIDs = [];
    roomParam.memory.reserveContainerIDs = [];
    let sources = []
    for (let sourceID of roomParam.memory.sourceIDs) {
        sources.push(Game.getObjectById(sourceID));
    }
    let containers = roomParam.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
    });
    for (let container of containers) {
        let adjacentSources = container.pos.findInRange(sources, 1);
        // Check if countainer is considered a sourceContainer
        if (adjacentSources.length != 0) {
            roomParam.memory.sourceContainerIDs.push(container.id);
            roomParam.memory.containerIDs.push(container.id);
        }
        // Container is considered a reserve container
        else {
            roomParam.memory.reserveContainerIDs.push(container.id);
            roomParam.memory.containerIDs.push(container.id);
        }
    }
};
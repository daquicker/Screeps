var roleHauler = {

    run: function (creep, sourceContainerIDs) {

        // Set memory.working to false if creep is working and out of energy
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvest');
        }

        // Set memory.working to true if creep is done picking up energy
        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('resupply');
        }

        // If creep is ready to work, look for work and go there
        if (creep.memory.working) {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) &&
                    structure.energy < structure.energyCapacity;
                }
            });
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#f24602' }, reusePath: 4 });
                }
            }
        }

        // Creep is not ready to work, look for energy source container with at least carryCapacity / 2 energy stored or tombstone and go there
        else {
            // Find all tombstones in the room, if any
            let tombstones = creep.room.find(FIND_TOMBSTONES);
            // If at least one tombstone found, go there and harvest it for energy
            if (tombstones.length != 0) {
                let closestTombstone = creep.pos.findClosestByPath(tombstones);
                if (creep.withdraw(closestTombstone, RESOURCE_ENERGY) != 0 && creep.ticksToLive > 50) {
                    creep.moveTo(closestTombstone, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 4 });
                }
            }
            // No tombstones in the room, find a source container to refill at
            else {
                let threshold = creep.carryCapacity / 2;
                let sourceContainers = []
                for (let sourceContainerID of sourceContainerIDs) {
                    sourceContainers.push(Game.getObjectById(sourceContainerID));
                }
                let container = creep.pos.findClosestByPath(sourceContainers, {
                    filter: (structure) => structure.store[RESOURCE_ENERGY] >= threshold
                });
                // Try to harvest and check if creep has long enough left to live
                if (creep.withdraw(container, RESOURCE_ENERGY) != 0 && creep.ticksToLive > 50) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 4 });
                }
            }
        }
    }
};

module.exports = roleHauler;
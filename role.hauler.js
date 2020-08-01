require('prototype.creep');
var roleHauler = {

    run: function (creep, sourceContainers, reserveContainers, tombstones, droppedResources) {

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
                creep.goTransfer(target);
            }
            else {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (reserveContainers.includes(structure) &&
                        structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
                    }
                });
                if (target) {
                    creep.goTransfer(target);
                }
            }
        }

        // Creep is not ready to work, look for energy source container with at least carryCapacity / 2 energy stored or tombstone/droppedResource and go there
        else {
            if (droppedResources.length != 0) {
                let closestDroppedResource = creep.pos.findClosestByPath(droppedResources);
                if (creep.pickup(closestDroppedResource) != 0 && creep.ticksToLive > 50) {
                    creep.moveTo(closestDroppedResource, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 4 });
                }
            }
            else if (tombstones.length != 0) {
                let closestTombstone = creep.pos.findClosestByPath(tombstones);
                if (creep.withdraw(closestTombstone, RESOURCE_ENERGY) != 0 && creep.ticksToLive > 50) {
                    creep.moveTo(closestTombstone, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 4 });
                }
            }
            // No tombstones in the room, find a source container to refill at
            else {
                let threshold = creep.carryCapacity / 2;
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
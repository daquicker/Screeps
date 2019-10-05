var roleBuilder = require('role.builder');

var roleHarvester = {

    run: function (creep, containerIDs, sourceIDs) {

        // Set memory.working to false if creep is working and out of energy
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvest');
        }

        // Set memory.working to true if creep is done harvesting energy
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
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#f24602' }, reusePath: 2 });
                }
            }
            // No resupply site found, run as upgrader
            else {
                roleBuilder.run(creep, containerIDs, sourceIDs);
            }
        }

        // Creep is not ready to work, look for energy source/container and go there
        else {
            // Check if containers are present in the room, if so, gather energy from closest container with enough energy stored
            if (containerIDs.length != 0) {
                let threshold = creep.carryCapacity;
                let containers = []
                for (let containerID of containerIDs) {
                    containers.push(Game.getObjectById(containerID));
                }
                let container = creep.pos.findClosestByPath(containers, {
                    filter: (container) => container.store[RESOURCE_ENERGY] >= threshold
                });
                // Try to withdraw if creep has long enough left to live
                if (creep.withdraw(container, RESOURCE_ENERGY) != 0 && creep.ticksToLive > 50) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 4 });
                }
            }
            // No containers in the room, find closest energy source to harvest
            else {
                let sources = [];
                for (let sourceID of sourceIDs) {
                    sources.push(Game.getObjectById(sourceID));
                }
                let source = creep.pos.findClosestByPath(sources);
                // Try to harvest and check if creep has long enough left to live
                if (creep.harvest(source) != 0 && creep.ticksToLive > 50) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 2 });
                }
            }
        }
    }
};

module.exports = roleHarvester;
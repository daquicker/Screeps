var roleBuilder = require('role.builder');

var roleHarvesterReboot = {

    run: function (creep, sources) {

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
                    structure.structureType == STRUCTURE_SPAWN) &&
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

            // Creep is not ready to work, look for energy source and go there
        else {
            let source = creep.pos.findClosestByPath(sources);
            // Try to harvest and check if creep has long enough left to live
            if (creep.harvest(source) != 0 && creep.ticksToLive > 50) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 2 });
            }
        }
    }
};

module.exports = roleHarvesterReboot;
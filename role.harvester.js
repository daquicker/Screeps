require('prototype.creep');
var roleBuilder = require('role.builder');

var roleHarvester = {

    run: function (creep, sourceContainers, sources) {

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
            // Look for spawn/extensions that need energy
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
                }
            });
            if (target) {
                creep.goTransfer(target);
            }
            else {
                // No spawn/extension needs energy, look for towers that need energy
                let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                        structure.energy < structure.energyCapacity;
                    }
                });
                if (target) {
                    creep.goTransfer(target);
                }
                // No resupply site found, run as upgrader
                else {
                    roleBuilder.run(creep, sourceContainers, sources);
                }
            }
        }

        // Creep is not ready to work, look for energy source/container and go there
        else {
            // Check if containers are present in the room, if so, gather energy from closest container with enough energy stored
            if (sourceContainers.length != 0) {
                creep.goWithdraw(sourceContainers);
            }
            // No containers in the room, find closest energy source to harvest
            else {
                creep.goHarvest(sources);
            }
        }
    }
};

module.exports = roleHarvester;
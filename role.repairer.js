require('prototype.creep');
var roleBuilder = require('role.builder');

var roleRepairer = {

    run: function (creep, containers, sources) {

        // Set memory.working to false if creep is working and out of energy
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvest');
        }

        // Set memory.working to true if creep is done harvesting energy
        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('repair');
        }

        // If creep is ready to work, look for work and go there
        if (creep.memory.working) {
            let closestDamagedStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if (closestDamagedStructure) {
                if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDamagedStructure.pos, { visualizePathStyle: { stroke: '#37ff14' }, reusePath: 2 });
                }
            }
                // No repair site found, run as upgrader
            else {
                roleBuilder.run(creep, containers, sources);
            }
        }

        // Creep is not ready to work, look for energy source/container and go there
        else {
            // Check if containers are present in the room, if so, gather energy from closest container with enough energy stored
            if (containers.length != 0) {
                creep.goWithdraw(containers);
            }
            // No containers in the room, find closest energy source to harvest
            else {
                creep.goHarvest(sources);
            }
        }
    }
};

module.exports = roleRepairer;
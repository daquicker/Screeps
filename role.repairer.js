var roleBuilder = require('role.builder');

var roleRepairer = {

    run: function (creep) {

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
                roleBuilder.run(creep);
            }
        }

            // Creep is not ready to work, look for energy source and go there
        else {
            let sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) != 0) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 2 });
            }
        }
    }
};

module.exports = roleRepairer;
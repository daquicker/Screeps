require('prototype.creep');
var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    run: function (creep, containers, sources) {

        // Set memory.working to false if creep is working and out of energy
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvest');
        }

        // Set memory.working to true if creep is done harvesting energy
        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('build');
        }

        // If creep is ready to work, look for work and go there
        if (creep.memory.working) {
            let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' }, reusePath: 2 });
                }
            }
                // No construction site found, run as upgrader
            else {
                roleUpgrader.run(creep, containers, sources);
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

module.exports = roleBuilder;
var roleUpgrader = {

    run: function (creep) {

        // Set memory.working to false if creep is working and out of energy
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvest');
        }

        // Set memory.working to true if creep is done harvesting energy
        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('upgrade');
        }

        // If creep is ready to work, look for work and go there
        if (creep.memory.working) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#14ffdb' }, reusePath: 2 });
            }
        }

            // Creep is not ready to work, look for energy source and go there
        else {
            let sources = creep.room.find(FIND_SOURCES);
            // Try to harvest and check if creep has long enough left to live
            if (creep.harvest(sources[3]) != 0 && creep.ticksToLive > 50) {
                creep.moveTo(sources[3], { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 2 });
            }
        }
    }
};

module.exports = roleUpgrader;
require('prototype.creep');

var roleHarvesterLong = {

    run: function (creep, containers) {

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

        // If creep is ready to work, look for container in home room and go there
        if (creep.memory.working) {
            // Check if creep is in the correct room
            if (creep.room.name == creep.memory.home) {
                target = creep.pos.findClosestByPath(containers, {
                    filter: (structure) => structure.store[RESOURCE_ENERGY] < structure.storeCapacity
                });
                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#f24602' }, reusePath: 4 });
                    }
                }
            }
            // Creep is not in the correct room, return home
            else {
                creep.moveToRoom(creep.room, creep.memory.home);
            }
        }

        // Creep is not ready to work, look for energy source and go there
        else {
            // Check if creep is in the correct room
            if (creep.room.name == creep.memory.targetRoomName) {
                let sources = creep.room.find(FIND_SOURCES, {
                    filter: (source) => {
                        return source.energy >= (creep.carryCapacity - creep.carry.energy) ||
                               source.ticksToRegeneration < 40;
                    }
            });
                creep.goHarvest(sources);
            }
            // creep is not in the correct room, move to correct room
            else {
                creep.moveToRoom(creep.room, creep.memory.targetRoomName);
            }
        }
    }
};

module.exports = roleHarvesterLong;
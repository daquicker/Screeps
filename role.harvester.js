var roleUpgrader = require('role.upgrader');

var roleHarvester = {

    run: function(creep) {

		// Set memory.working to false if creep is working and out of energy
	    if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvest');
	    }
		
		// Set memory.working to true if creep is done harvesting energy
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('resupply');
	    }

		// If creep is ready to work, look for work and go there
	    if(creep.memory.working) {
	        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
				return (structure.structureType == STRUCTURE_EXTENSION ||
				structure.structureType == STRUCTURE_SPAWN ||
				structure.structureType == STRUCTURE_TOWER) &&
				structure.energy < structure.energyCapacity;
				}
            });
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#f24602'}});
                }
            }
			// No resupply site found, run as upgrader
			else {
				roleUpgrader.run(creep);
			}
	    }

		// Creep is not ready to work, look for energy source and go there
	    else {
	        let sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleHarvester;
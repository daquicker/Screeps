var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    // pseudo-code to run a tower by its ID --UNTESTED--
    var tower = Game.getObjectById('66ae77142b090824f4c3b22e');
    if (tower) {
        roleTower.run(tower);
    }

    // 'Garbage collection' in the memory - remove dead creeps from memory
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }

    // Initialize variables to keep count of creeps per type
    var buildersCount = 7
    var harvestersCount = 2
    var repairersCount = 1
    var upgradersCount = 1

    // Iterate through all creeps and run appropriate code by memory-set role and count them - Put whatever type you most likely have most of first to reduce unnecessary checks
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role == 'builder') {
            buildersCount += 1;
            roleBuilder.run(creep);
        }
        else if (creep.memory.role == 'harvester') {
            harvestersCount += 1;
            roleHarvester.run(creep);
        }
        else if (creep.memory.role == 'repairer') {
            repairersCount += 1;
            roleRepairer.run(creep);
        }
        else if (creep.memory.role == 'upgrader') {
            upgradersCount += 1;
            roleUpgrader.run(creep);
        }
    }

    // Set desired number of creeps per role
    var desiredBuildersCount = 5
    var desiredHarvestersCount = 3
    var desiredRepairersCount = 1
    var desiredUpgradersCount = 1

    // Spawn extra creeps if necessary and possibly - Only one can be spawned at the same time, priority goes from top to bottom
    if (harvestersCount < desiredHarvestersCount) {
        let newName = 'Harvester' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: 'harvester' } });
    }
    else if (repairersCount < desiredRepairersCount) {
        let newName = 'repairer' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: 'repairer' } });
    }
    else if (buildersCount < desiredBuildersCount) {
        let newName = 'builder' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: 'builder' } });
    }
    else if (upgradersCount < desiredUpgradersCount) {
        let newName = 'upgrader' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: 'upgrader' } });
    }
}
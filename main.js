require('prototype.spawn')();
var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');
var roleTower = require('role.tower');

module.exports.loop = function () {

    // pseudo-code to run a tower by its ID --UNTESTED--
    var tower = Game.getObjectById('1ba0f079b43bd5da652235e1');
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
    var buildersCount = 0
    var harvestersCount = 0
    var repairersCount = 0
    var upgradersCount = 0

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
    var desiredBuildersCount = 3
    var desiredHarvestersCount = 2
    var desiredRepairersCount = 1
    var desiredUpgradersCount = 1

    // Get maximum energy capacity in the room
    var maxEnergy = Game.spawns['Spawn1'].room.energyCapacityAvailable;

    // Spawn extra creeps if necessary and possibly - Only one can be spawned at the same time, priority goes from top to bottom
    if (harvestersCount < desiredHarvestersCount) {
        let newName = 'Harvester' + Game.time;
        Game.spawns['Spawn1'].createCustomCreep(maxEnergy, 'harvester');
    }
    else if (repairersCount < desiredRepairersCount) {
        let newName = 'repairer' + Game.time;
        Game.spawns['Spawn1'].createCustomCreep(maxEnergy, 'repairer');
    }
    else if (buildersCount < desiredBuildersCount) {
        let newName = 'builder' + Game.time;
        Game.spawns['Spawn1'].createCustomCreep(maxEnergy, 'builder');
    }
    else if (upgradersCount < desiredUpgradersCount) {
        let newName = 'upgrader' + Game.time;
        Game.spawns['Spawn1'].createCustomCreep(maxEnergy, 'upgrader');
    }
}
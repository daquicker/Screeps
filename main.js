require('prototype.spawn')();
var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');
var roleTower = require('role.tower');

module.exports.loop = function () {

    // Get towers and run them
    var towers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER);
    for (let i = 0; i < towers.length; i++) {
        let tower = towers[i];
        if (tower) {
            roleTower.run(tower);
        }
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

    // Iterate through all creeps, run appropriate code by memory-set role and count them - Put whatever type you most likely have most of first to reduce unnecessary checks
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

    // Store total number of owned creeps in a variable
    var creepsCount = buildersCount + harvestersCount + repairersCount + upgradersCount;

    // Set desired number of creeps per role
    var desiredBuildersCount = 4
    var desiredHarvestersCount = 2
    var desiredRepairersCount = 1
    var desiredUpgradersCount = 1

    // Get maximum energy capacity in the room
    var maxEnergy = Game.spawns['Spawn1'].room.energyCapacityAvailable;

    // Spawn a small harvester to (re)start the colony when needed
    if (creepsCount == 0) {
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], 'rebootHarvester', { memory: { role: 'harvester' } });
    }
        // Spawn extra creeps if necessary and possible - Only one can be spawned at the same time, priority goes from top to bottom
    else if (harvestersCount < desiredHarvestersCount) {
        Game.spawns['Spawn1'].createCustomCreep(maxEnergy, 'harvester');
    }
    else if (repairersCount < desiredRepairersCount) {
        Game.spawns['Spawn1'].createCustomCreep(maxEnergy, 'repairer');
    }
    else if (buildersCount < desiredBuildersCount) {
        Game.spawns['Spawn1'].createCustomCreep(maxEnergy, 'builder');
    }
    else if (upgradersCount < desiredUpgradersCount) {
        Game.spawns['Spawn1'].createCustomCreep(maxEnergy, 'upgrader');
    }
}
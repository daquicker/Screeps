require('prototype.spawn')();
var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');
var roleTower = require('role.tower');

// Initialize empty 'traversed' array in memory if it doesn't exist yet
if (!Memory.traversed) {
    Memory.traversed = [];
}

module.exports.loop = function () {

    // Order initial roads if not done before
    if (!Memory.initializedRoad) {
        let constrRoads = require('construction.roads.init');
        constrRoads.run('Spawn1');
        Memory.initializedRoad = 1;
    }

    // Get towers and run them
    var towers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER);
    for (let ind in towers) {
        let tower = towers[ind];
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

    // Iterate through all creeps, run appropriate per-creep code and count them.
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];

        // Add current creep position to 'traversed' array in memory
        Memory.traversed.push(creep.pos);

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

    // Check 'traversed' array in memory for positions that need roads constructed and reset 'traversed' array in memory
    if (Memory.traversed.length >= 1000) {
        let constrRoadsRep = require('construction.roads.repeat');
        constrRoadsRep.run(Memory.traversed, 'Spawn1');
        // Reset 'traversed' array
        Memory.traversed = [];
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
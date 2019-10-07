require('prototype.spawn.averaged')();
require('prototype.spawn.miner')();
require('prototype.spawn.hauler')();
var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleHarvesterReboot = require('role.harvester.reboot');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');
var roleHauler = require('role.hauler');
var roleMiner = require('role.miner');
var roleTower = require('role.tower');

// Initialize empty 'traversed' array in room memory if it doesn't exist yet
if (!Game.spawns['Spawn1'].room.memory.traversed) {
    Game.spawns['Spawn1'].room.memory.traversed = [];
}

// Initialize empty 'sourceContainerIDs' array in room memory if it doesn't exist yet
if (!Game.spawns['Spawn1'].room.memory.sourceContainerIDs) {
    Game.spawns['Spawn1'].room.memory.sourceContainerIDs = [];
}

// Initialize empty 'reserveContainerIDs' array in room memory if it doesn't exist yet
if (!Game.spawns['Spawn1'].room.memory.reserveContainerIDs) {
    Game.spawns['Spawn1'].room.memory.reserveContainerIDs = [];
}

// Initialize empty 'containerIDs' array in room memory if it doesn't exist yet
if (!Game.spawns['Spawn1'].room.memory.containerIDs) {
    Game.spawns['Spawn1'].room.memory.containerIDs = [];
}

// Initialize 'containerCheckCount' integer in room memory if it doesn't exist yet
if (!Game.spawns['Spawn1'].room.memory.containerCheckCount) {
    Game.spawns['Spawn1'].room.memory.containerCheckCount = 0;
}

// Initialize 'traversedCount' integer in room memory if it doesn't exist yet
if (!Game.spawns['Spawn1'].room.memory.traversedCount) {
    Game.spawns['Spawn1'].room.memory.traversedCount = 0;
}

// Set 'sourceIDs' array in room memory if it doesn't exist yet
if (!Game.spawns['Spawn1'].room.memory.sourceIDs) {
    Game.spawns['Spawn1'].room.memory.sourceIDs = [];
    let sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
    for (let ind in sources) {
        Game.spawns['Spawn1'].room.memory.sourceIDs.push(sources[ind].id);
    }
}

module.exports.loop = function () {

    // Order initial roads if not done before
    if (!Game.spawns['Spawn1'].room.memory.initializedRoad) {
        let constrRoads = require('construction.roads.init');
        constrRoads.run('Spawn1', Game.spawns['Spawn1'].room.memory.sourceIDs);
        Game.spawns['Spawn1'].room.memory.initializedRoad = 1;
    }

    // Get towers and run them
    var towers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        roleTower.run(tower);
    }

    // 'Garbage collection' in the memory - remove dead creeps from memory
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }

    // Update 'containerIDs', 'sourceContainerIDs' and 'reserveContainerIDs' arrays in room memory if enough cycles have passed
    if (Game.spawns['Spawn1'].room.memory.containerCheckCount > 200) {
        Game.spawns['Spawn1'].room.memory.containerIDs = [];
        Game.spawns['Spawn1'].room.memory.sourceContainerIDs = [];
        Game.spawns['Spawn1'].room.memory.reserveContainerIDs = [];
        let sources = []
        for (let sourceID of Game.spawns['Spawn1'].room.memory.sourceIDs) {
            sources.push(Game.getObjectById(sourceID));
        }
        let containers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
        });
        for (let container of containers) {
            let adjacentSources = container.pos.findInRange(sources, 1);
        // Check if countainer is considered a sourceContainer
            if (adjacentSources.length != 0) {
                Game.spawns['Spawn1'].room.memory.sourceContainerIDs.push(container.id);
                Game.spawns['Spawn1'].room.memory.containerIDs.push(container.id);
            }
                // Container is considered a reserve container
            else {
                Game.spawns['Spawn1'].room.memory.reserveContainerIDs.push(container.id);
                Game.spawns['Spawn1'].room.memory.containerIDs.push(container.id);
            }
        }
        // reset counter
        Game.spawns['Spawn1'].room.memory.containerCheckCount = 0
    }
        // Else add up containerCheckCount by 1
    else {
        Game.spawns['Spawn1'].room.memory.containerCheckCount += 1;
    }

    // Check if there are any tombstones containing energy in the room, set their IDs in memory and keep them in a variable
    Game.spawns['Spawn1'].room.memory.tombstoneIDs = [];
    var tombstones = Game.spawns['Spawn1'].room.find(FIND_TOMBSTONES, { filter: (tombstone) => tombstone.store[RESOURCE_ENERGY] > 0 });
    for (let tombstone of tombstones) {
        Game.spawns['Spawn1'].room.memory.tombstoneIDs.push(tombstone.id);
    }

    // Get some frequently used data from memory and set it in variables
    var containers = [];
    for (let containerID of Game.spawns['Spawn1'].room.memory.containerIDs) {
        containers.push(Game.getObjectById(containerID));
    }
    var sourceContainers = [];
    for (let sourceContainerID of Game.spawns['Spawn1'].room.memory.sourceContainerIDs) {
        sourceContainers.push(Game.getObjectById(sourceContainerID));
    }
    var reserveContainers = [];
    for (let reserveContainerID of Game.spawns['Spawn1'].room.memory.reserveContainerIDs) {
        reserveContainers.push(Game.getObjectById(reserveContainerID));
    }
    var sources = [];
    for (let sourceID of Game.spawns['Spawn1'].room.memory.sourceIDs) {
        sources.push(Game.getObjectById(sourceID));
    }

    // Initialize variables to keep count of creeps per type
    var buildersCount = 0;
    var harvestersCount = 0;
    var repairersCount = 0;
    var upgradersCount = 0;
    var minersCount = 0;
    var haulersCount = 0;

    // Iterate through all creeps, run appropriate per-creep code and count them.
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];

        if (creep.memory.role == 'builder') {
            buildersCount += 1;
            // Add current creep position to 'traversed' array in memory
            Game.spawns['Spawn1'].room.memory.traversed.push(creep.pos);
            roleBuilder.run(creep, containers, sources);
        }
            // Only used to (re)start the colony
        else if (creep.memory.role == 'harvesterReboot') {
            roleHarvesterReboot.run(creep, Game.spawns['Spawn1'].room.memory.sources);
        }
        else if (creep.memory.role == 'harvester') {
            harvestersCount += 1;
            // Add current creep position to 'traversed' array in memory
            Game.spawns['Spawn1'].room.memory.traversed.push(creep.pos);
            roleHarvester.run(creep, containers, sources);
        }
        else if (creep.memory.role == 'repairer') {
            repairersCount += 1;
            // Add current creep position to 'traversed' array in memory
            Game.spawns['Spawn1'].room.memory.traversed.push(creep.pos);
            roleRepairer.run(creep, containers, sources);
        }
        else if (creep.memory.role == 'upgrader') {
            upgradersCount += 1;
            // Add current creep position to 'traversed' array in memory
            Game.spawns['Spawn1'].room.memory.traversed.push(creep.pos);
            roleUpgrader.run(creep, containers, sources);
        }
        else if (creep.memory.role == 'miner') {
            minersCount += 1;
            roleMiner.run(creep);
        }
        else if (creep.memory.role == 'hauler') {
            haulersCount += 1;
            // Add current creep position to 'traversed' array in memory
            Game.spawns['Spawn1'].room.memory.traversed.push(creep.pos);
            roleHauler.run(creep, sourceContainers, tombstones);
        }
    }

    // Store total number of owned creeps (except miners) in a variable
    var creepsCount = buildersCount + harvestersCount + repairersCount + upgradersCount + haulersCount;

    // Add up number of creeps currently alive to keep track of how many data points are stored in 'traversed' array - each creep adds one data point per cycle
    Game.spawns['Spawn1'].room.memory.traversedCount += creepsCount;

    // Run logic governing additional road building if enough data points have been gathered in 'traversed' array in memory
    if (Game.spawns['Spawn1'].room.memory.traversedCount >= 1000) {
        let constrRoadsRep = require('construction.roads.repeat');
        constrRoadsRep.run(Game.spawns['Spawn1'].room.memory.traversed, Game.spawns['Spawn1'].room.memory.traversedCount, 'Spawn1');
        // Reset 'traversed' array
        Game.spawns['Spawn1'].room.memory.traversed = [];
        // Reset traversedCount
        Game.spawns['Spawn1'].room.memory.traversedCount = 0;
    }

    // Set desired number of creeps per role
    var desiredBuildersCount = 1;
    if (minersCount < 1) {
        var desiredHarvestersCount = 2;
        var desiredHaulersCount = 0;
    }
    else {
        var desiredHarvestersCount = 0;
        var desiredHaulersCount = 2;
    }
    var desiredRepairersCount = 1;
    var desiredUpgradersCount = 1;

    // Get maximum energy capacity in the room
    var maxEnergy = Game.spawns['Spawn1'].room.energyCapacityAvailable;

    // Spawn a small harvester to (re)start the colony when needed
    if (creepsCount == 0) {
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], 'rebootHarvester', { memory: { role: 'harvesterReboot' } });
    }
    // Spawn extra creeps if necessary and possible - Only one can be spawned at the same time, priority goes from top to bottom
    else if (harvestersCount < desiredHarvestersCount) {
        Game.spawns['Spawn1'].createAveragedCreep(maxEnergy, 'harvester');
    }
    else if (haulersCount < desiredHaulersCount) {
        Game.spawns['Spawn1'].createHaulerCreep(maxEnergy);
    }
    else if (repairersCount < desiredRepairersCount) {
        Game.spawns['Spawn1'].createAveragedCreep(maxEnergy, 'repairer');
    }
    else if (buildersCount < desiredBuildersCount) {
        Game.spawns['Spawn1'].createAveragedCreep(maxEnergy, 'builder');
    }
    else if (upgradersCount < desiredUpgradersCount) {
        Game.spawns['Spawn1'].createAveragedCreep(maxEnergy, 'upgrader');
    }

    // Check if each source in the room has a dedicated miner creep alive and spawn a new one if needed
    for (let sourceID of Game.spawns['Spawn1'].room.memory.sourceIDs) {
        // Find miner with sourceID in memory
        let miner = _.filter(Game.creeps, i => i.memory.sourceID == sourceID);
        // Check if any miner with sourceID in memory was found
        if (miner.length < 1) {
            let source = Game.getObjectById(sourceID);
            // Check if any containers found adjacent to source, if so, spawn new miner creep
            if (sourceContainers.length != 0) {
                let adjacentContainers = source.pos.findInRange(sourceContainers, 1);
                if (adjacentContainers.length != 0) {
                    Game.spawns['Spawn1'].createMinerCreep(maxEnergy, sourceID, adjacentContainers[0].id);
                }
            }
        }
    }
}
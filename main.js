require('prototype.spawn')();
var updateContainers = require('update.containers');
var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleHarvesterLong = require('role.harvester.long');
var roleHarvesterReboot = require('role.harvester.reboot');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');
var roleHauler = require('role.hauler');
var roleMiner = require('role.miner');
var roleTower = require('role.tower');
var adjRoomNames = require('adjacent.room.names');
var constrRoadsRep = require('construction.roads.repeat');
var constrRoads = require('construction.roads.init');

module.exports.loop = function () {

    // Remove dead creeps from memory
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }

    var roomSpawn = Game.spawns['Spawn1'];

    // Initialize empty 'traversed' array in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.traversed) {
        roomSpawn.room.memory.traversed = [];
    }

    // Initialize empty 'sourceContainerIDs' array in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.sourceContainerIDs) {
        roomSpawn.room.memory.sourceContainerIDs = [];
    }

    // Initialize empty 'reserveContainerIDs' array in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.reserveContainerIDs) {
        roomSpawn.room.memory.reserveContainerIDs = [];
    }

    // Initialize empty 'containerIDs' array in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.containerIDs) {
        roomSpawn.room.memory.containerIDs = [];
    }

    // Initialize 'containerCheckCount' integer in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.containerCheckCount) {
        roomSpawn.room.memory.containerCheckCount = 0;
    }

    // Initialize 'traversedCount' integer in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.traversedCount) {
        roomSpawn.room.memory.traversedCount = 0;
    }

    // Set 'sourceIDs' array in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.sourceIDs) {
        roomSpawn.room.memory.sourceIDs = [];
        let sources = roomSpawn.room.find(FIND_SOURCES);
        for (let ind in sources) {
            roomSpawn.room.memory.sourceIDs.push(sources[ind].id);
        }
    }

    // Set 'roomNameN' in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.roomNameN) {
        roomSpawn.room.memory.roomNameN = adjRoomNames.north(roomSpawn.room);
    }

    // Set 'roomNameS' in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.roomNameS) {
        roomSpawn.room.memory.roomNameS = adjRoomNames.south(roomSpawn.room);
    }

    // Set 'roomNameE' in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.roomNameE) {
        roomSpawn.room.memory.roomNameE = adjRoomNames.east(roomSpawn.room);
    }

    // Set 'roomNameW' in room memory if it doesn't exist yet
    if (!roomSpawn.room.memory.roomNameW) {
        roomSpawn.room.memory.roomNameW = adjRoomNames.west(roomSpawn.room);
    }

    // Order initial roads if not done before
    if (!roomSpawn.room.memory.initializedRoad) {
        constrRoads.run(roomSpawn, roomSpawn.room.memory.sourceIDs);
        roomSpawn.room.memory.initializedRoad = 1;
    }

    // Get towers and run them
    var towers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        roleTower.run(tower);
    }

    // Update 'containerIDs', 'sourceContainerIDs' and 'reserveContainerIDs' arrays in room memory if enough cycles have passed
    if (roomSpawn.room.memory.containerCheckCount > 200) {
        updateContainers(roomSpawn.room);
        // reset counter
        roomSpawn.room.memory.containerCheckCount = 0
    }
        // Else add up containerCheckCount by 1
    else {
        roomSpawn.room.memory.containerCheckCount += 1;
    }

    // Check if there are any tombstones containing energy in the room, set their IDs in memory and keep them in a variable
    roomSpawn.room.memory.tombstoneIDs = [];
    var tombstones = roomSpawn.room.find(FIND_TOMBSTONES, { filter: (tombstone) => tombstone.store[RESOURCE_ENERGY] > 0 });
    for (let tombstone of tombstones) {
        roomSpawn.room.memory.tombstoneIDs.push(tombstone.id);
    }

    // Get some frequently used data from memory and set it in variables
    var containers = [];
    for (let containerID of roomSpawn.room.memory.containerIDs) {
        containers.push(Game.getObjectById(containerID));
    }
    var sourceContainers = [];
    for (let sourceContainerID of roomSpawn.room.memory.sourceContainerIDs) {
        sourceContainers.push(Game.getObjectById(sourceContainerID));
    }
    var reserveContainers = [];
    for (let reserveContainerID of roomSpawn.room.memory.reserveContainerIDs) {
        reserveContainers.push(Game.getObjectById(reserveContainerID));
    }
    var sources = [];
    for (let sourceID of roomSpawn.room.memory.sourceIDs) {
        sources.push(Game.getObjectById(sourceID));
    }

    // Get maximum energy capacity in the room
    var maxEnergy = roomSpawn.room.energyCapacityAvailable;

    // Initialize variables to keep count of creeps per type
    var buildersCount = 0;
    var harvestersCount = 0;
    var harvestersLongCount = 0;
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
            roomSpawn.room.memory.traversed.push(creep.pos);
            roleBuilder.run(creep, containers, sources);
        }
            // Only used to (re)start the colony
        else if (creep.memory.role == 'harvesterReboot') {
            roleHarvesterReboot.run(creep, containers, sources);
        }
        else if (creep.memory.role == 'harvester') {
            harvestersCount += 1;
            // Add current creep position to 'traversed' array in memory
            roomSpawn.room.memory.traversed.push(creep.pos);
            roleHarvester.run(creep, sourceContainers, sources);
        }
        else if (creep.memory.role == 'harvesterLong') {
            harvestersLongCount += 1;
            roleHarvesterLong.run(creep, containers);
        }
        else if (creep.memory.role == 'repairer') {
            repairersCount += 1;
            // Add current creep position to 'traversed' array in memory
            roomSpawn.room.memory.traversed.push(creep.pos);
            roleRepairer.run(creep, containers, sources);
        }
        else if (creep.memory.role == 'upgrader') {
            upgradersCount += 1;
            // Add current creep position to 'traversed' array in memory
            roomSpawn.room.memory.traversed.push(creep.pos);
            roleUpgrader.run(creep, containers, sources);
        }
        else if (creep.memory.role == 'miner') {
            minersCount += 1;
            roleMiner.run(creep);
        }
        else if (creep.memory.role == 'hauler') {
            haulersCount += 1;
            // Add current creep position to 'traversed' array in memory
            roomSpawn.room.memory.traversed.push(creep.pos);
            roleHauler.run(creep, sourceContainers, reserveContainers, tombstones);
        }
    }

    // Store total number of owned creeps (except miners) in a variable
    var creepsCount = buildersCount + harvestersCount + repairersCount + upgradersCount + haulersCount;

    // Add up number of creeps currently alive to keep track of how many data points are stored in 'traversed' array - each creep adds one data point per cycle
    roomSpawn.room.memory.traversedCount += creepsCount;

    // Run logic governing additional road building if enough data points have been gathered in 'traversed' array in memory
    if (roomSpawn.room.memory.traversedCount >= 1000) {
        constrRoadsRep.run(roomSpawn.room.memory.traversed, roomSpawn.room.memory.traversedCount, roomSpawn);
        // Reset 'traversed' array
        roomSpawn.room.memory.traversed = [];
        // Reset traversedCount
        roomSpawn.room.memory.traversedCount = 0;
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
    var desiredHarvestersLongCount = 3;

    // Spawn a small harvester to (re)start the colony when needed
    if (creepsCount == 0) {
        roomSpawn.spawnCreep([WORK, CARRY, MOVE], 'rebootHarvester', { memory: { role: 'harvesterReboot' } });
    }
        // Spawn extra creeps if necessary and possible - Only one can be spawned at the same time, priority goes from top to bottom
    else if (harvestersCount < desiredHarvestersCount) {
        roomSpawn.createAveragedCreep(maxEnergy, 'harvester');
    }
    else if (haulersCount < desiredHaulersCount) {
        roomSpawn.createHaulerCreep(maxEnergy);
    }
    else if (repairersCount < desiredRepairersCount) {
        roomSpawn.createAveragedCreep(maxEnergy, 'repairer');
    }
    else if (buildersCount < desiredBuildersCount) {
        roomSpawn.createAveragedCreep(maxEnergy, 'builder');
    }
    else if (upgradersCount < desiredUpgradersCount) {
        roomSpawn.createAveragedCreep(maxEnergy, 'upgrader');
    }
    else if (harvestersLongCount < desiredHarvestersLongCount) {
        roomSpawn.createHarvesterLongCreep(maxEnergy, 'harvesterLong', roomSpawn.room.name, roomSpawn.room.memory.roomNameN);
    }

    // Check if each source in the room has a dedicated miner creep alive and spawn a new one if needed
    for (let sourceID of roomSpawn.room.memory.sourceIDs) {
    // Find miner with sourceID in memory
        let miner = _.filter(Game.creeps, i => i.memory.sourceID == sourceID);
    // Check if any miner with sourceID in memory was found
        if (miner.length < 1) {
            let source = Game.getObjectById(sourceID);
            // Check if any containers found adjacent to source, if so, spawn new miner creep
            if (sourceContainers.length != 0) {
                let adjacentContainers = source.pos.findInRange(sourceContainers, 1);
                if (adjacentContainers.length != 0) {
                    roomSpawn.createMinerCreep(maxEnergy, sourceID, adjacentContainers[0].id);
                }
            }
        }
    }
}
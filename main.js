require('prototype.spawn')();
var constrRoads = require('construction.roads');
var memoryRoomInit = require('memory.room.init');
var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleHarvesterLong = require('role.harvester.long');
var roleHarvesterReboot = require('role.harvester.reboot');
var roleHauler = require('role.hauler');
var roleMiner = require('role.miner');
var roleRepairer = require('role.repairer');
var roleScout = require('role.scout');
var roleTower = require('role.tower');
var roleUpgrader = require('role.upgrader');
var updateContainers = require('update.containers');


module.exports.loop = function () {

    // Remove dead creeps from memory
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }

    // Create shorthand variable for Spawn1
    var roomSpawn = Game.spawns['Spawn1'];

    // Run memory init for the room
    memoryRoomInit.run(true, roomSpawn.room);

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

    // Order initial roads if not done before
    if (!roomSpawn.room.memory.initializedRoad) {
        constrRoads.init(roomSpawn, sources);
        roomSpawn.room.memory.initializedRoad = 1;
    }

    // Initialize variables to keep count of creeps per type
    var buildersCount = 0;
    var harvestersCount = 0;
    var repairersCount = 0;
    var upgradersCount = 0;
    var minersCount = 0;
    var haulersCount = 0;
    var scoutsCount = 0;

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
        else if (creep.memory.role == 'scout') {
            scoutsCount += 1;
            roleScout.run(creep);
        }
    }

    // Store total number of creeps used in roadbuilding in a variable
    var creepsCount = buildersCount + harvestersCount + repairersCount + upgradersCount + haulersCount;

    // Add up 'creepsCount' to keep track of how many data points are stored in 'traversed' array
    roomSpawn.room.memory.traversedCount += creepsCount;

    // Run logic governing additional road building if enough data points have been gathered in 'traversed' array in memory
    if (roomSpawn.room.memory.traversedCount >= 1000) {
        constrRoads.repeat(roomSpawn.room.memory.traversed, roomSpawn.room.memory.traversedCount, roomSpawn);
        // Reset 'traversed' array
        roomSpawn.room.memory.traversed = [];
        // Reset traversedCount
        roomSpawn.room.memory.traversedCount = 0;
        // Check if roads to room exits need to be built
        if (!roomSpawn.room.memory.exitRoadsBuilt && (roomSpawn.room.controller.level > 3)) {
            roomSpawn.room.memory.exitRoadsBuilt = 1;
            for (let currentRoomName in Memory.rooms) {
                let targetRoomMemory = Memory.rooms[currentRoomName];
                if (!targetRoomMemory.mainRoom && (targetRoomMemory.sourceIDs.length != 0)) {
                    constrRoads.exitRoad(roomSpawn, currentRoomName, targetRoomMemory.sourceIDs[0]);
                }
            }
        }
    }

    // Set desired number of creeps per role
    var desiredBuildersCount = 1;
    if (sourceContainers.length < 1) {
        var desiredHarvestersCount = 2;
        var desiredHaulersCount = 0;
    }
    else {
        var desiredHarvestersCount = 0;
        var desiredHaulersCount = 2;
    }
    if (towers.length < 1) {
        var desiredRepairersCount = 1;
    }
    else {
        var desiredRepairersCount = 0;
    }
    var desiredUpgradersCount = 1;
    let adjRoomNameW = roomSpawn.room.memory.roomNameW;
    if ((roomSpawn.room.controller.level > 2) && !Memory.rooms[adjRoomNameW]) {
        var desiredScoutsCount = 1;
    }
    else {
        var desiredScoutsCount = 0;
    }

    // Check if each source in the room has a dedicated miner creep alive and spawn a new one if needed
    for (let sourceID of roomSpawn.room.memory.sourceIDs) {
        // Find miner with sourceID in memory
        let miner = _.filter(Game.creeps, (creep) => creep.memory.sourceID == sourceID);
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
    else if (scoutsCount < desiredScoutsCount) {
        roomSpawn.createScoutCreep('scout', roomSpawn.room.name);
    }
    else {
        // Check if each room that isn't a main room has enough long distance harvester creeps targeted at it
        for (let currentRoomName in Memory.rooms) {
            let targetRoomMemory = Memory.rooms[currentRoomName];
            if (!targetRoomMemory.mainRoom) {
                let harvestersLong = _.filter(Game.creeps, (creep) => creep.memory.targetRoomName == currentRoomName);
                if (harvestersLong.length < (targetRoomMemory.sourceIDs.length * 2)) {
                    roomSpawn.createHarvesterLongCreep(maxEnergy, 'harvesterLong', roomSpawn.room.name, currentRoomName);
                }
            }
        }
    }
}
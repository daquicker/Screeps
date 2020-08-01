module.exports = function () {
    StructureSpawn.prototype.createAveragedCreep =
        function (energy, roleName) {
            // Get maximum (balanced) number of parts with given energy, but no more than 21 total - CARRY = 50, MOVE = 50, WORK = 100
            var maxParts = Math.min(Math.floor(energy / 200), 7);
            var body = [];
            for (let i = 0; i < maxParts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < maxParts; i++) {
                body.push(CARRY);
            }
            for (let i = 0; i < maxParts; i++) {
                body.push(MOVE);
            }

            let creepName = roleName + Game.time;
            return this.spawnCreep(body, creepName, { memory: { role: roleName, working: false } });
        };

    StructureSpawn.prototype.createHaulerCreep =
        function (energy) {
            // Get maximum number of CARRY and MOVE parts with given energy (2 to 1 ratio), but no more than 15 parts total - MOVE = 50, CARRY = 50
            var maxParts = Math.min(Math.floor(energy / 50), 15);
            var maxCarryParts = Math.floor((maxParts / 3) * 2);
            var maxMoveParts = maxParts - maxCarryParts;
            var body = [];

            // Add add as many CARRY parts as possible given current room's energy constraints
            for (let i = 0; i < maxCarryParts; i++) {
                body.push(CARRY);
            }
            // Add add as many MOVE parts as possible given current room's energy constraints
            for (let i = 0; i < maxMoveParts; i++) {
                body.push(MOVE);
            }

            let creepName = 'Hauler' + Game.time;
            return this.spawnCreep(body, creepName, { memory: { role: 'hauler', working: false } });
        };

    StructureSpawn.prototype.createMinerCreep =
        function (energy, sourceIDParam, containerIDParam) {
            // Get maximum number of WORK parts with given energy - MOVE = 50, WORK = 100
            var maxWorkParts = Math.floor((energy - 50) / 100);
            var body = [];
            // Add a single MOVE part
            body.push(MOVE);
            // Add add as many WORK parts as possible given current room's energy constraints, but no more than 5
            for (let i = 0; i < Math.min(maxWorkParts, 5) ; i++) {
                body.push(WORK);
            }

            let creepName = 'Miner' + Game.time;
            return this.spawnCreep(body, creepName, { memory: { role: 'miner', sourceID: sourceIDParam, containerID: containerIDParam } });
        };

    StructureSpawn.prototype.createHarvesterLongCreep =
        function (energy, roleName, homeParam, targetRoomNameParam) {
            // Get maximum number of parts with given energy, but no more than 21 total - CARRY = 50, MOVE = 50, WORK = 100
            var maxParts = Math.min(Math.floor(energy / 200), 7);
            var body = [];
            for (let i = 2; i < maxParts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < maxParts; i++) {
                body.push(CARRY);
            }
            for (let i = 0; i < maxParts; i++) {
                body.push(MOVE);
            }

            let creepName = roleName + Game.time;
            return this.spawnCreep(body, creepName, { memory: { role: roleName, working: false, home: homeParam, targetRoomName: targetRoomNameParam } });
        };

    StructureSpawn.prototype.createScoutCreep =
        function (roleName, homeParam) {
            // Creep only consists of 1 MOVE part - MOVE = 50
            var body = [MOVE];
            let creepName = roleName + Game.time;
            return this.spawnCreep(body, creepName, { memory: { role: roleName, home: homeParam } });
        };
};
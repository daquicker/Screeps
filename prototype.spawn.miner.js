module.exports = function () {
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
};
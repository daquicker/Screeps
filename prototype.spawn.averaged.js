module.exports = function () {
    StructureSpawn.prototype.createAveragedCreep =
        function (energy, roleName) {
            // Get maximum (balanced) number of parts with given energy - CARRY = 50, MOVE = 50, WORK = 100
            var maxParts = Math.floor(energy / 200);
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
};
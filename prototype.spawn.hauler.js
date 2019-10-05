module.exports = function () {
    StructureSpawn.prototype.createHaulerCreep =
        function (energy) {
            // Get maximum number of CARRY and MOVE parts with given energy (2 to 1 ratio), but no more than 21 parts total - MOVE = 50, CARRY = 50
            var maxParts = Math.min(Math.floor(energy / 50), 21);
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
};
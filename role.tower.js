var roleTower = {

    run: function (tower) {
        var DamagedStructures = tower.pos.findInRange(FIND_STRUCTURES, 10, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (DamagedStructures) {
            tower.repair(DamagedStructures[0]);
        }

        var closestHostile = tower.pos.findInRange(FIND_HOSTILE_CREEPS, 10);
        if (closestHostile) {
            tower.attack(closestHostile[0]);
        }
    }
};
module.exports = roleTower;
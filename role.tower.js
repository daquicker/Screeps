var roleTower = {

    run: function (tower) {
        var closestDamagedStructure = tower.pos.findInRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        }, 5);
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }
};
module.exports = roleTower;
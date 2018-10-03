var roleTower = {

    run: function (tower) {
        var DamagedStructures = tower.pos.findInRange(FIND_STRUCTURES, 5, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (DamagedStructures) {
            tower.repair(DamagedStructures[0]);
        }

        var closestHostile = tower.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
        console.log(closestHostile);
        if (closestHostile) {
            tower.attack(closestHostile[0]);
        }
    }
};
module.exports = roleTower;
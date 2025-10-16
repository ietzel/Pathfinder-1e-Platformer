class Creature {
    constructor(name, abilityScores = [str, dex, con, int, wis, cha]) {
        name = name;
        abilityScores = abilityScores;
        abilityAdjusters = [0, 0, 0, 0, 0, 0];
        xp = 0;
        savings = 0;
    }
    draw() {

    }
    attack() {
        ability = Math.max(abilityScores);
    }
    move() {

    }
}
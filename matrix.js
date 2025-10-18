// Define the array of conditions, abilities, and effects
const effectsList = [
    'Bleed',
    'Blinded',
    'Charmed',
    'Confused',
    'Cowering',
    'Dazzled',
    'Deafened',
    'Diseased',
    'Drained',
    'Exhausted',
    'Fascinated',
    'Fatigued',
    'Flat-Footed',
    'Frightened',
    'Grappled',
    'Nauseated',
    'Panicked',
    'Paralyzed',
    'Poisoned',
    'Prone',
    'Shaken',
    'Sickened',
    'Staggered',
    'Stunned',
    'Unconscious',
    'STR Damage',
    'DEX Damage',
    'CON Damage',
    'INT Damage',
    'WIS Damage',
    'CHA Damage',
];

// Initialize an empty square matrix based on the effectsList length
const matrixSize = effectsList.length;
const effectsMatrix = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(''));

// Function to mark an intersection with 'x'
function markEffect(cause, effect) {
    const causeIndex = effectsList.indexOf(cause);
    const effectIndex = effectsList.indexOf(effect);
    if (causeIndex !== -1 && effectIndex !== -1) {
        effectsMatrix[causeIndex][effectIndex] = 'x';
    }
}

// ---- BEGIN POPULATING THE MATRIX ----
// Some causes can result in other effects. Note that this is not an exhaustive list.
// The primary cause (a monster ability, a spell, environmental hazard) is assumed.
// These entries show how one effect on a character can cause another.

// A creature that is Exhausted becomes Fatigued first
markEffect('Fatigued', 'Exhausted');

// Failing a save against a Frightened effect can turn it into a Panicked effect
markEffect('Frightened', 'Panicked');

// Taking STR damage can cause a character to fall Unconscious if the damage exceeds the score
markEffect('STR Damage', 'Unconscious');
// Taking CON damage can cause a character to die if the damage exceeds the score
markEffect('CON Damage', 'Unconscious');

// A Grappled creature is considered Flat-Footed
markEffect('Grappled', 'Flat-Footed');

// A Prone creature is often Flat-Footed against melee attacks
markEffect('Prone', 'Flat-Footed');

// The Confused condition can cause a character to attack themself, potentially dealing damage
// and leading to other effects.

// A creature with the Staggered condition can become Unconscious if it takes too many rounds without rest
markEffect('Staggered', 'Unconscious');

// Being Blinded imposes a Flat-Footed condition
markEffect('Blinded', 'Flat-Footed');

// Some afflictions, like Crypt Fever (a curse), can cause both Disease and ability damage
markEffect('Diseased', 'STR Damage'); // Example
markEffect('Diseased', 'CON Damage'); // Example

// A Nauseated character cannot take any standard actions and is often Flat-Footed or otherwise impaired
markEffect('Nauseated', 'Flat-Footed');

// ---- END POPULATING THE MATRIX ----

// --- JS table generation ---
function generateHTMLTable(causes, matrix) {
    let html = '<table>';
    // Header row
    html += '<thead><tr><th>Cause / Effect</th>';
    for (const effect of causes) {
        html += `<th>${effect}</th>`;
    }
    html += '</tr></thead>';

    // Body rows
    html += '<tbody>';
    for (let i = 0; i < causes.length; i++) {
        html += `<tr><th>${causes[i]}</th>`;
        for (let j = 0; j < causes.length; j++) {
            html += `<td style="text-align: center;">${matrix[i][j]}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';

    return html;
}
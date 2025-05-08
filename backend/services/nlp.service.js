
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function getQueryVector(query) {
    const { stdout } = await execPromise(`python3 get_embedding.py "${query}"`);
    return JSON.parse(stdout);
}

module.exports = { getQueryVector };
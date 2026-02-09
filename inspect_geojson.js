const fs = require('fs');

function checkFile(path) {
    try {
        if (!fs.existsSync(path)) {
            console.log(`File not found: ${path}`);
            return;
        }
        const data = fs.readFileSync(path, 'utf8');
        const json = JSON.parse(data);
        console.log(`\nChecking ${path}:`);
        console.log(`Type: ${json.type}`);
        console.log(`Features: ${json.features.length}`);

        const jk = json.features.find(f => {
            const name = f.properties.NAME_1 || f.properties.name || f.properties.ST_NM;
            return name && name.toLowerCase().includes('jammu');
        });

        if (jk) {
            console.log('✅ Found Jammu & Kashmir!');
            console.log('Properties:', JSON.stringify(jk.properties));
            console.log('Geometry Type:', jk.geometry.type);
        } else {
            console.log('❌ Jammu & Kashmir NOT found.');
        }

        const ladakh = json.features.find(f => {
            const name = f.properties.NAME_1 || f.properties.name || f.properties.ST_NM;
            return name && name.toLowerCase().includes('ladakh');
        });

        if (ladakh) {
            console.log('✅ Found Ladakh!');
        } else {
            console.log('❌ Ladakh NOT found.');
        }

    } catch (e) {
        console.error(`Error reading ${path}:`, e.message);
    }
}

checkFile('./js/data/temp_check.geojson');
checkFile('./js/data/temp_check_datameet.geojson');
checkFile('./js/data/india_states.geojson');

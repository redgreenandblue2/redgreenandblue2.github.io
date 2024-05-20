document.addEventListener('DOMContentLoaded', function() {
    const emojiContainer = document.getElementById('emojiContainer');
    const generateButton = document.getElementById('generateButton');
    const chunkXInput = document.getElementById('chunkX');
    const chunkYInput = document.getElementById('chunkY');
    const currentChunk = document.getElementById('currentChunk');
    const copyButton = document.getElementById('copyButton');
    const seed = 0;  // Set a fixed seed value
    const threshold = 0.1;
    const scale = 70.0;

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(t, a, b) {
        return a + t * (b - a);
    }

    function gradient(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 8 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    function perlinNoise2D(x, y, seed) {
        const p = Array.from({ length: 256 }, (_, i) => i);
        Math.seedrandom(seed);
        p.sort(() => Math.random() - 0.5);
        p.push(...p);

        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);

        const u = fade(xf);
        const v = fade(yf);

        const aa = p[p[xi] + yi];
        const ab = p[p[xi] + yi + 1];
        const ba = p[p[xi + 1] + yi];
        const bb = p[p[xi + 1] + yi + 1];

        const x1 = lerp(u, gradient(aa, xf, yf), gradient(ba, xf - 1, yf));
        const x2 = lerp(u, gradient(ab, xf, yf - 1), gradient(bb, xf - 1, yf - 1));

        return lerp(v, x1, x2);
    }

    function generatePerlinNoiseAtCoordinate(x, y, scale, seed) {
        return perlinNoise2D(x / scale, y / scale, seed);
    }

    function diamondChunk(x, y) {
        const chunkSeed = x * 31 + y * 37;
        Math.seedrandom(chunkSeed);
        return Math.floor(Math.random() * 6) === 0 ? 1 : 0;
    }

    function getTileContentAtCoordinate(x, y, threshold, scale, seed) {
        const originalSeed = seed; // Store the original seed
        const noiseValue = generatePerlinNoiseAtCoordinate(x, y, scale, seed);
        const stoneNoise = generatePerlinNoiseAtCoordinate(x, y, scale / 2, seed + 1);
    
        if (noiseValue > threshold) {
            if (stoneNoise > threshold * 2) {
                if (diamondChunk(Math.floor(x / 8), Math.floor((y - 1) / 8)) === 1) {
                    Math.seedrandom(x * 8 + y);
                const isTree = Math.random() < 0.05; // Adjust probability as needed
                console.log(`Is Tree at (${x}, ${y}): ${seed}`);
                // Math.seedrandom(originalSeed);
                return isTree ? '💎' : '🪨';
                }
                return '🪨';  // Stones
            } else {
                // Random chance for tree or land
                Math.seedrandom(x * 8 + y);
                const isTree = Math.random() < 0.15; // Adjust probability as needed
                console.log(`Is Tree at (${x}, ${y}): ${seed}`);
                // Math.seedrandom(originalSeed);
                return isTree ? '🌲' : '🟩';
                // return '🟩';
            }
        } else {
            return '🟦';  // Water
        }
    }
    

    function printBoard(x, y, seed, vision) {
        emojiContainer.innerHTML = '';  // Clear the previous grid
        let clipboardContent = '';
        for (let i = 0; i < vision; i++) {
            for (let j = 0; j < vision; j++) {
                const emojiCell = document.createElement('div');
                emojiCell.className = 'emoji-cell';
                const emoji = getTileContentAtCoordinate(x + j, y - i, threshold, scale, seed);
                emojiCell.textContent = emoji;
                emojiContainer.appendChild(emojiCell);
                clipboardContent += emoji + ' ';
            }
            clipboardContent += '\n';
        }
        currentChunk.textContent = `Currently displaying chunk (${x / 8 - 1}, ${y / 8})`;

        // Add event listener for copy button
        copyButton.onclick = () => {
            navigator.clipboard.writeText(clipboardContent.trim()).then(() => {
                alert('Grid copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        };
    }

    generateButton.addEventListener('click', () => {
        const chunkX = parseInt(chunkXInput.value) || 0;
        const chunkY = parseInt(chunkYInput.value) || 0;
        const x = (chunkX + 1) * 8;
        const y = chunkY * 8;
        printBoard(x, y, seed, 8);
    });

    // Start with chunk (0, 0)
    const x = 8;
    const y = 0;
    const vision = 8;

    printBoard(x, y, seed, vision);
});

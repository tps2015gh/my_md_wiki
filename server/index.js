import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const NOTES_DIR = path.join(__dirname, '..', 'note');

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));

async function getGraphData() {
    const files = await glob('**/*.md', { cwd: NOTES_DIR });
    const nodes = [];
    const links = [];
    const nodeSet = new Set();
    const segmenter = new Intl.Segmenter(['th', 'en'], { granularity: 'word' });

    for (const file of files) {
        const id = path.basename(file, '.md');
        const content = await fs.readFile(path.join(NOTES_DIR, file), 'utf-8');
        
        if (!nodeSet.has(id)) {
            // Basic summary: first 150 chars
            const summary = content.substring(0, 150).replace(/[#*`[\]]/g, '') + '...';
            
            // Extract keywords using Intl.Segmenter
            const segments = segmenter.segment(content);
            const words = Array.from(segments)
                .filter(s => s.isWordLike)
                .map(s => s.segment.toLowerCase())
                .filter(w => w.length > 2);
            
            // Get top 5 keywords for "near cluster" analysis
            const freq = {};
            words.forEach(w => freq[w] = (freq[w] || 0) + 1);
            const keywords = Object.keys(freq)
                .sort((a, b) => freq[b] - freq[a])
                .slice(0, 5);

            nodes.push({ id, name: id, summary, keywords });
            nodeSet.add(id);
        }

        const wikiLinkRegex = /\[\[(.*?)\]\]/g;
        let match;
        while ((match = wikiLinkRegex.exec(content)) !== null) {
            const target = match[1];
            links.push({ source: id, target: target });
            
            if (!nodeSet.has(target)) {
                nodes.push({ id: target, name: target, summary: 'External or uncreated note.', keywords: [] });
                nodeSet.add(target);
            }
        }
    }

    return { nodes, links };
}

app.get('/api/graph', async (req, res) => {
    try {
        const data = await getGraphData();
        
        // Add Similarity Links (Vectors of Nearness)
        const similarityLinks = [];
        const threshold = 0.2; // 20% overlap threshold

        for (let i = 0; i < data.nodes.length; i++) {
            for (let j = i + 1; j < data.nodes.length; j++) {
                const nodeA = data.nodes[i];
                const nodeB = data.nodes[j];
                
                if (nodeA.keywords.length === 0 || nodeB.keywords.length === 0) continue;

                const setA = new Set(nodeA.keywords);
                const setB = new Set(nodeB.keywords);
                const intersection = [...setA].filter(x => setB.has(x));
                const union = new Set([...setA, ...setB]);
                const similarity = intersection.length / union.size;

                if (similarity > threshold) {
                    similarityLinks.push({
                        source: nodeA.id,
                        target: nodeB.id,
                        value: similarity,
                        type: 'similarity' // Distinguish from wiki-links
                    });
                }
            }
        }

        data.links = [...data.links.map(l => ({ ...l, type: 'wiki' })), ...similarityLinks];
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

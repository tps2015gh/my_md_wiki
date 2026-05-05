import inquirer from 'inquirer';
import { spawn } from 'child_process';
import path from 'path';
import open from 'open';
import fs from 'fs-extra';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess = null;
const PORT = 3000;
const NOTES_DIR = path.join(__dirname, 'note');

async function showMenu() {
    const { action } = await inquirer.prompt([
        {
            type: 'rawlist',
            name: 'action',
            message: 'Wiki Graph CLI - Select an action:',
            choices: [
                'Start Server',
                'Stop Server',
                'View Status',
                'Generate News Data',
                'Index Vector DB',
                'Query Vector DB',
                'Open Browser',
                'Show Info',
                'Exit'
            ]
        }
    ]);

    switch (action) {
        case 'Start Server':
            startServer();
            break;
        case 'Stop Server':
            stopServer();
            break;
        case 'View Status':
            viewStatus();
            break;
        case 'Generate News Data':
            runGenerator();
            break;
        case 'Index Vector DB':
            indexVectorDb();
            break;
        case 'Query Vector DB':
            queryVectorDb();
            break;
        case 'Open Browser':
            openBrowser();
            break;
        case 'Show Info':
            showInfo();
            break;
        case 'Exit':
            stopServer();
            process.exit();
            break;
    }
}

function indexVectorDb() {
    console.log(chalk.blue('Indexing notes into Vector DB...'));
    const indexer = spawn('python', ['vector_tool.py', 'index'], { stdio: 'inherit' });
    indexer.on('close', () => {
        showMenu();
    });
}

async function queryVectorDb() {
    const { query } = await inquirer.prompt([
        {
            type: 'input',
            name: 'query',
            message: 'Enter search query:'
        }
    ]);
    
    const searcher = spawn('python', ['vector_tool.py', 'query', query], { stdio: 'inherit' });
    searcher.on('close', () => {
        setTimeout(showMenu, 500);
    });
}

function runGenerator() {
    console.log(chalk.blue('Running Python News Generator...'));
    const gen = spawn('python', ['generate_news.py'], { stdio: 'inherit' });
    gen.on('close', () => {
        console.log(chalk.green('Generation complete!'));
        showMenu();
    });
}

function startServer() {
    if (serverProcess) {
        console.log(chalk.yellow('Server is already running.'));
        return showMenu();
    }

    serverProcess = spawn('node', [path.join(__dirname, 'server', 'index.js')], {
        detached: false,
        stdio: 'inherit'
    });

    console.log(chalk.green('Server started on http://localhost:' + PORT));
    
    setTimeout(showMenu, 1000);
}

function stopServer() {
    if (!serverProcess) {
        console.log(chalk.yellow('Server is not running.'));
    } else {
        serverProcess.kill();
        serverProcess = null;
        console.log(chalk.red('Server stopped.'));
    }
    showMenu();
}

function viewStatus() {
    console.log(chalk.blue('--- System Status ---'));
    console.log(`Server: ${serverProcess ? chalk.green('RUNNING') : chalk.red('STOPPED')}`);
    console.log(`Port: ${PORT}`);
    console.log(`Notes Directory: ${NOTES_DIR}`);
    if (fs.existsSync(NOTES_DIR)) {
        const files = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'));
        console.log(`Note count: ${files.length}`);
    }
    console.log('---------------------');
    showMenu();
}

async function openBrowser() {
    console.log(chalk.blue('Opening browser...'));
    await open(`http://localhost:${PORT}`);
    showMenu();
}

function showInfo() {
    console.log(chalk.cyan('--- Wiki Graph Info ---'));
    console.log('Features:');
    console.log('- Obsidian-like force-directed graph');
    console.log('- Wiki link parsing [[Link]]');
    console.log('- Zoom and Pan support');
    console.log('- Node Shaking (simulation reheat)');
    console.log('- Connection summary on node click');
    console.log('-------------------------');
    showMenu();
}

console.log(chalk.bold.magenta('Welcome to Wiki Graph CLI!'));
showMenu();

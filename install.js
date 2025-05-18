const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');

const platform = os.platform();
const arch = os.arch();
const version = '1.0.0';

const BASE_URL = 'https://github.com/yourusername/glucolink/releases/latest/download';

function getDownloadUrl() {
    switch(platform) {
        case 'win32':
            return `${BASE_URL}/GlucoLink-Setup-${version}.exe`;
        case 'darwin':
            return `${BASE_URL}/GlucoLink-${version}.dmg`;
        case 'linux':
            return `${BASE_URL}/GlucoLink-${version}.AppImage`;
        default:
            console.log('Unsupported platform. Please visit our website to download manually.');
            process.exit(1);
    }
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest);
            reject(err);
        });
    });
}

async function install() {
    console.log('Installing GlucoLink...');
    console.log(`Detected platform: ${platform}`);
    
    const downloadUrl = getDownloadUrl();
    const fileName = path.basename(downloadUrl);
    const downloadPath = path.join(os.tmpdir(), fileName);

    console.log('Downloading...');
    await downloadFile(downloadUrl, downloadPath);
    console.log('Download complete!');

    console.log('Starting installation...');
    switch(platform) {
        case 'win32':
            exec(`"${downloadPath}"`, (err) => {
                if (err) console.error('Error during installation:', err);
            });
            break;
        case 'darwin':
            exec(`open "${downloadPath}"`, (err) => {
                if (err) console.error('Error during installation:', err);
            });
            break;
        case 'linux':
            exec(`chmod +x "${downloadPath}" && "${downloadPath}"`, (err) => {
                if (err) console.error('Error during installation:', err);
            });
            break;
    }
}

install().catch(console.error); 
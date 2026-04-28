#!/usr/bin/env node
import { execSync } from 'child_process';
function getPreviousTag() {
    try {
        const tags = execSync('git tag --sort=-creatordate', { encoding: 'utf-8' }).trim().split('\n');
        return tags[0] || '';
    }
    catch {
        return '';
    }
}
function getCommitType(commitMsg) {
    const msg = commitMsg.toLowerCase();
    if (msg.startsWith('feat') || msg.includes(': add') || msg.includes('feat('))
        return 'feat';
    if (msg.startsWith('fix') || msg.includes('fix('))
        return 'fix';
    if (msg.startsWith('refactor') || msg.startsWith('perf') || msg.startsWith('revert'))
        return 'refactor';
    if (msg.startsWith('docs') || msg.startsWith('chore') || msg.startsWith('style') || msg.startsWith('test'))
        return 'chore';
    return 'other';
}
function parseCommits(previousTag) {
    const range = previousTag ? `${previousTag}..HEAD` : 'HEAD';
    const commits = execSync(`git log ${range} --format=%s`, { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .filter(Boolean);
    const types = new Set();
    for (const c of commits) {
        const t = getCommitType(c);
        if (t && t !== 'other')
            types.add(t);
    }
    return Array.from(types);
}
function runRelease(releaseType) {
    console.log(`\n📦 Running ${releaseType} release...\n`);
    execSync(`standard-version --release-as ${releaseType}`, { stdio: 'inherit' });
}
async function main() {
    const previousTag = getPreviousTag();
    console.log(`Previous tag: ${previousTag}\n`);
    const types = parseCommits(previousTag);
    console.log(`Commit types: ${types.join(', ') || 'none'}`);
    const hasFeat = types.includes('feat');
    const hasFix = types.includes('fix');
    const hasBreaking = types.some(t => t.includes('!'));
    let releaseType = 'patch';
    if (hasBreaking) {
        releaseType = 'major';
    }
    else if (hasFeat) {
        releaseType = 'minor';
    }
    else if (hasFix && !hasFeat) {
        releaseType = 'patch';
    }
    console.log(`Detected release type: ${releaseType}`);
    runRelease(releaseType);
}
main().catch(console.error);

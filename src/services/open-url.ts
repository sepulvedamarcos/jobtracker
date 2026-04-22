import { spawn } from 'child_process';

const getOpenCommand = (url: string) => {
    if (process.platform === 'win32') {
        return { command: 'cmd', args: ['/c', 'start', '', url] };
    }

    if (process.platform === 'darwin') {
        return { command: 'open', args: [url] };
    }

    return { command: 'xdg-open', args: [url] };
};

export const openUrl = async (url: string): Promise<void> => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
        throw new Error('URL vacía');
    }

    const { command, args } = getOpenCommand(trimmedUrl);

    await new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, {
            detached: true,
            stdio: 'ignore',
        });

        child.once('error', reject);
        child.once('spawn', () => {
            child.unref();
            resolve();
        });
    });
};

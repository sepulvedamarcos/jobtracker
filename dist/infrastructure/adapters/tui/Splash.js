import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import { getPluginsDir } from '../../plugins/PluginPathResolver.js';
import fs from 'fs';
// Verificar si hay errores bloqueantes
const hasBlockingErrors = (checks) => {
    return checks.some(c => c.status === 'error');
};
export const Splash = ({ onFinish }) => {
    const [checks, setChecks] = useState([]);
    const [blocked, setBlocked] = useState(false);
    useEffect(() => {
        // Checks síncronos
        const results = [];
        // 1. Verificar directorio de plugins
        try {
            const pluginsDir = getPluginsDir();
            if (!fs.existsSync(pluginsDir)) {
                fs.mkdirSync(pluginsDir, { recursive: true });
            }
            results.push({ name: 'Directorio de plugins', status: 'ok', message: 'OK' });
        }
        catch {
            results.push({ name: 'Directorio de plugins', status: 'error', message: 'ERROR' });
        }
        // 2. Verificar plugins instalados
        try {
            const pluginsDir = getPluginsDir();
            if (fs.existsSync(pluginsDir)) {
                const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
                const plugins = entries.filter(e => e.isDirectory() && !e.name.startsWith('_'));
                if (plugins.length === 0) {
                    results.push({ name: 'Plugins', status: 'warning', message: 'Sin plugins' });
                }
                else {
                    results.push({ name: 'Plugins', status: 'ok', message: `${plugins.length} OK` });
                }
            }
        }
        catch {
            results.push({ name: 'Plugins', status: 'warning', message: 'No verificado' });
        }
        // 3. Verificar playwright (requerido para scraping)
        const checkPlaywright = async () => {
            try {
                // @ts-ignore
                const { chromium, firefox, webkit } = await import('playwright');
                // Intentar launch con cualquier browser disponible
                let browser = null;
                let browserName = '';
                try {
                    browser = await chromium.launch({ headless: true });
                    browserName = 'Chromium';
                }
                catch { }
                if (!browser) {
                    try {
                        browser = await firefox.launch({ headless: true });
                        browserName = 'Firefox';
                    }
                    catch { }
                }
                if (!browser) {
                    try {
                        browser = await webkit.launch({ headless: true });
                        browserName = 'WebKit';
                    }
                    catch { }
                }
                if (browser) {
                    await browser.close();
                    setChecks(prev => [...prev, { name: 'Playwright', status: 'ok', message: `${browserName} OK` }]);
                }
                else {
                    setChecks(prev => [...prev, { name: 'Playwright', status: 'error', message: 'Sin browsers' }]);
                    setBlocked(true);
                }
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'No disponible';
                setChecks(prev => [...prev, { name: 'Playwright', status: 'error', message: msg }]);
                setBlocked(true);
            }
        };
        setChecks(results);
        checkPlaywright();
    }, [onFinish]);
    // Continuar solo si no está bloqueado
    useEffect(() => {
        if (!blocked && checks.length > 0) {
            const timer = setTimeout(onFinish, 2500);
            return () => clearTimeout(timer);
        }
    }, [blocked, checks.length, onFinish]);
    return (_jsxs(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, width: "100%", borderStyle: "round", borderColor: blocked ? 'red' : 'cyan', paddingBottom: 2, children: [_jsx(Gradient, { name: "summer", children: _jsx(BigText, { text: "Job Tracker", font: "chrome" }) }), _jsx(Text, { italic: true, color: "cyan", children: "Validando entorno..." }), blocked && (_jsxs(Box, { marginTop: 2, children: [_jsx(Text, { bold: true, color: "red", children: "ERROR: Faltan dependencias requeridas." }), _jsx(Text, { color: "gray", children: "Ejecuta: npx playwright install" })] })), checks.length > 0 && (_jsx(Box, { flexDirection: "column", marginTop: 1, children: checks.map((check, i) => (_jsxs(Box, { children: [_jsx(Text, { color: check.status === 'ok' ? 'green' : check.status === 'warning' ? 'yellow' : 'red', children: check.status === 'ok' ? '✓' : check.status === 'warning' ? '⚠' : '✗' }), _jsxs(Text, { color: "gray", children: [" ", check.name, ": "] }), _jsx(Text, { children: check.message })] }, i))) }))] }));
};

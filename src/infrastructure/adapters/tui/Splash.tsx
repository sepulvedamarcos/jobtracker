import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import { getPluginsDir } from '../../plugins/PluginPathResolver.js';
import { checkForUpdate, type UpdateInfo } from '../../../services/update-checker.js';
import fs from 'fs';

interface Props {
  onFinish: () => void;
  onUpdateCheck?: (info: UpdateInfo | null) => void;
}

interface CheckResult {
  name: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
}

// Verificar si hay errores bloqueantes
const hasBlockingErrors = (checks: CheckResult[]) => {
  return checks.some(c => c.status === 'error');
};

export const Splash = ({ onFinish, onUpdateCheck }: Props) => {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  
  useEffect(() => {
    checkForUpdate().then(info => {
      setUpdateInfo(info);
      onUpdateCheck?.(info);
    });
  }, [onUpdateCheck]);

  useEffect(() => {
    const results: CheckResult[] = [];
    
    // 1. Verificar directorio de plugins
    try {
      const pluginsDir = getPluginsDir();
      if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true });
      }
      results.push({ name: 'Directorio de plugins', status: 'ok', message: 'OK' });
    } catch {
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
        } else {
          results.push({ name: 'Plugins', status: 'ok', message: `${plugins.length} OK` });
        }
      }
    } catch {
      results.push({ name: 'Plugins', status: 'warning', message: 'No verificado' });
    }

    // 3. Verificar playwright (requerido para scraping)
    const checkPlaywright = async () => {
      try {
        // Intentar importar playwright - si no está, es solo un warning
        // @ts-ignore
        const playwrightModule = await import('playwright');
        const { chromium, firefox, webkit } = playwrightModule;
        
        // Intentar launch con cualquier browser disponible
        let browser = null;
        let browserName = '';
        
        try {
          browser = await chromium.launch({ headless: true });
          browserName = 'Chromium';
        } catch {}
        
        if (!browser) {
          try {
            browser = await firefox.launch({ headless: true });
            browserName = 'Firefox';
          } catch {}
        }
        
        if (!browser) {
          try {
            browser = await webkit.launch({ headless: true });
            browserName = 'WebKit';
          } catch {}
        }
        
        if (browser) {
          await browser.close();
          setChecks(prev => [...prev, { name: 'Playwright', status: 'ok', message: `${browserName} OK` }]);
        } else {
          // Playwright instalado pero sin browsers - warning, no bloquea
          setChecks(prev => [...prev, { name: 'Playwright', status: 'warning', message: 'Sin browsers (ejecuta: npx playwright install)' }]);
        }
      } catch (err) {
        // Playwright no está instalado - solo es un warning, no bloquea la app
        const msg = err instanceof Error ? err.message : 'No disponible';
        setChecks(prev => [...prev, { name: 'Playwright', status: 'warning', message: 'No instalado (scraping no disponible)' }]);
        // NO bloquear la app - solo es un warning
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

  return (
    <Box 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      flexGrow={1}
      width="100%"
      borderStyle="round" 
      borderColor={blocked ? 'red' : 'cyan'}
      paddingBottom={2}
    >
      <Gradient name="summer"  >
        <BigText text="Job Tracker" font="chrome" />
      </Gradient>
      
<Text italic color="cyan">Validando entorno...</Text>

        <Text color="gray">
          {updateInfo === null ? '◐ Buscando actualizaciones...' : 
           updateInfo.hasUpdate ? '✓ Actualización disponible' : '✓ Versión al día'}
        </Text>
       
       {blocked && (
         <Box marginTop={2}>
           <Text bold color="red">
             ERROR: Faltan dependencias requeridas.
           </Text>
<Text color="gray">
              Ejecuta: npx playwright install
            </Text>
         </Box>
       )}
       
       {checks.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {checks.map((check, i) => (
            <Box key={i}>
              <Text color={check.status === 'ok' ? 'green' : check.status === 'warning' ? 'yellow' : 'red'}>
                {check.status === 'ok' ? '✓' : check.status === 'warning' ? '⚠' : '✗'}
              </Text>
              <Text color="gray"> {check.name}: </Text>
              <Text>{check.message}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// src/infrastructure/logger/Logger.ts
/**
 * Logger - Sistema de logs para debugging
 * Guarda en ~/.local/share/jobtracker/logs/
 */
import fs from 'fs';
import path from 'path';
import envPaths from 'env-paths';

const getLogDir = (): string => {
  const paths = envPaths('jobtracker', { suffix: '' });
  const logDir = path.join(paths.data, 'logs');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  return logDir;
};

const getLogFileName = (): string => {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  return `jobtracker-${date}.log`;
};

const formatMessage = (level: string, message: string, data?: unknown): string => {
  const timestamp = new Date().toISOString();
  let logLine = `[${timestamp}] [${level}] ${message}`;
  
  if (data !== undefined) {
    logLine += ` | ${JSON.stringify(data)}`;
  }
  
  return logLine;
};

export const logger = {
  info: (message: string, data?: unknown) => {
    const logFile = path.join(getLogDir(), getLogFileName());
    const logLine = formatMessage('INFO', message, data) + '\n';
    fs.appendFileSync(logFile, logLine);
    console.log(logLine.trim());
  },
  
  warn: (message: string, data?: unknown) => {
    const logFile = path.join(getLogDir(), getLogFileName());
    const logLine = formatMessage('WARN', message, data) + '\n';
    fs.appendFileSync(logFile, logLine);
    console.warn(logLine.trim());
  },
  
  error: (message: string, data?: unknown) => {
    const logFile = path.join(getLogDir(), getLogFileName());
    const logLine = formatMessage('ERROR', message, data) + '\n';
    fs.appendFileSync(logFile, logLine);
    console.error(logLine.trim());
  },
  
  debug: (message: string, data?: unknown) => {
    const logFile = path.join(getLogDir(), getLogFileName());
    const logLine = formatMessage('DEBUG', message, data) + '\n';
    fs.appendFileSync(logFile, logLine);
    // Debug solo en desarrollo
    if (process.env.JOBTRACKER_DEV === 'true') {
      console.log(logLine.trim());
    }
  },
  
  // Para marcar entrada/salida de funciones
  trace: (location: string, action: 'ENTER' | 'EXIT', extra?: unknown) => {
    const logFile = path.join(getLogDir(), getLogFileName());
    const timestamp = new Date().toISOString();
    let logLine = `[${timestamp}] [TRACE] ${action} ${location}`;
    if (extra) {
      logLine += ` | ${JSON.stringify(extra)}`;
    }
    fs.appendFileSync(logFile, logLine + '\n');
  },
};
#!/usr/bin/env node

/* eslint-disable */

const fs = require('fs');
const path = require('path');

function buildWebAppExecUrl(deployId) {
  return `https://script.google.com/macros/s/${String(deployId).trim()}/exec`;
}

function buildWebAppDevUrl(deployId) {
  return `https://script.google.com/macros/s/${String(deployId).trim()}/dev`;
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function tryReadJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return readJsonFile(filePath);
  } catch {
    return null;
  }
}

function loadGasConfig(projectRoot, configFileName = '.gas-config.json') {
  const configPath = path.join(projectRoot, configFileName);
  return tryReadJsonFile(configPath);
}

function resolveExecUrlFromGasConfig(config) {
  const proxyExecUrl = config?.proxy?.execUrl;
  if (typeof proxyExecUrl === 'string' && proxyExecUrl.trim()) {
    return proxyExecUrl.trim();
  }

  const proxyDeployId = config?.proxy?.targetDeployId;
  if (typeof proxyDeployId === 'string' && proxyDeployId.trim()) {
    return buildWebAppExecUrl(proxyDeployId);
  }

  const deployId = config?.deployments?.targetDeployId;
  if (typeof deployId === 'string' && deployId.trim()) {
    return buildWebAppExecUrl(deployId);
  }

  return null;
}

function resolveExecUrl({ projectRoot, execUrlOverride, envVar = 'GAS_EXEC_URL' }) {
  if (execUrlOverride && String(execUrlOverride).trim()) {
    return String(execUrlOverride).trim();
  }

  const env = process.env[envVar];
  if (env && String(env).trim()) {
    return String(env).trim();
  }

  const config = loadGasConfig(projectRoot);
  if (!config) {
    throw new Error(
      'Missing .gas-config.json. Set env ' +
        envVar +
        ' or create .gas-config.json (proxy.execUrl / proxy.targetDeployId / deployments.targetDeployId).'
    );
  }

  const url = resolveExecUrlFromGasConfig(config);
  if (!url) {
    throw new Error('Invalid .gas-config.json: expected proxy.execUrl, proxy.targetDeployId, or deployments.targetDeployId');
  }
  return url;
}

function resolveHeadDevUrlFromGasConfig(config) {
  const id = config?.deployments?.headDeployId;
  if (typeof id === 'string' && id.trim()) return buildWebAppDevUrl(id);
  return null;
}

module.exports = {
  buildWebAppExecUrl,
  buildWebAppDevUrl,
  loadGasConfig,
  resolveExecUrlFromGasConfig,
  resolveExecUrl,
  resolveHeadDevUrlFromGasConfig,
};

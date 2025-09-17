/**
 * Global type declarations for Google Apps Script environment
 * These types are available globally in the GAS runtime but may not be available in testing environments
 */

/// <reference types="google-apps-script" />

// Core GAS Services
declare const Logger: GoogleAppsScript.Base.Logger;
declare const SpreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
declare const ScriptApp: GoogleAppsScript.Script.ScriptApp;
declare const Session: GoogleAppsScript.Base.Session;
declare const Utilities: GoogleAppsScript.Utilities.Utilities;
declare const PropertiesService: GoogleAppsScript.Properties.PropertiesService;
declare const LockService: GoogleAppsScript.Lock.LockService;

// Additional globals that might be needed in test environments
declare const console: Console;
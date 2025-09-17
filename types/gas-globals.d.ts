/**
 * Global type declarations for Google Apps Script environment
 * These types are available globally in the GAS runtime but may not be available in testing environments
 */

/// <reference types="google-apps-script" />

// Core GAS Services
declare var Logger: GoogleAppsScript.Base.Logger;
declare var SpreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
declare var ScriptApp: GoogleAppsScript.Script.ScriptApp;
declare var Session: GoogleAppsScript.Base.Session;
declare var Utilities: GoogleAppsScript.Utilities.Utilities;
declare var PropertiesService: GoogleAppsScript.Properties.PropertiesService;
declare var LockService: GoogleAppsScript.Lock.LockService;

// Additional globals that might be needed in test environments
declare var console: Console;
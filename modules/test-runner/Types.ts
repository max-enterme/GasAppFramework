/**
 * Test Runner Module - Type Definitions
 */

import type { CustomOutputGenerator } from '../testing/Runner';

/** Configuration for test execution */
export interface TestRunnerConfig {
    /** Base URL for test runner (for navigation links) */
    baseUrl?: string;
    /** Title to display in HTML output */
    title?: string;
    /** Whether to show detailed timing information */
    showTiming?: boolean;
    /** Maximum execution time before warning (ms) */
    warningThreshold?: number;
    /** Custom output generator for additional information */
    customOutputGenerator?: CustomOutputGenerator;
}

/** Options for HTML reporting */
export interface HtmlReporterOptions {
    /** Show individual test details (default: true) */
    showDetails?: boolean;
    /** Group by category (default: true) */
    groupByCategory?: boolean;
    /** Include CSS styling (default: true) */
    includeStyles?: boolean;
    /** Custom CSS to inject */
    customCss?: string;
}

/** Test discovery result */
export interface TestDiscoveryResult {
    /** Total number of tests found */
    total: number;
    /** Tests organized by category */
    byCategory: Map<string, number>;
    /** List of all test names */
    testNames: string[];
}

/** Test execution request from URL parameters */
export interface TestRequest {
    /** Run all tests */
    all?: boolean;
    /** Run specific category */
    category?: string;
    /** List categories only */
    list?: boolean;
    /** Output format ('html' | 'json') */
    format?: 'html' | 'json';
}

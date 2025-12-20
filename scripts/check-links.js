#!/usr/bin/env node
/**
 * Site Link Checker
 * Validates all internal links in the application
 * 
 * Usage: node scripts/check-links.js
 */

// Known routes in the application
const ROUTES = [
    '/',
    '/events',
    '/discover',
    '/wallet',
    '/club',
    '/club/create',
    '/settings',
    '/settings/vendor',
    '/settings/language',
    '/settings/pricing',
    '/settings/changelog',
    '/settings/report',
    '/settings/report/submit',
    '/map',
    '/redeem',
    '/following',
    '/help',
    '/contact',
    '/terms',
    '/privacy',
    '/disclaimer',
    '/payment-terms',
    '/host',
    '/host/edit',
    '/host/dashboard',
    '/host/manage',
    '/admin',
    '/admin/reports',
];

// API routes to validate
const API_ROUTES = [
    '/api/events',
    '/api/clubs',
    '/api/og',
];

async function checkLink(baseUrl, path) {
    const url = `${baseUrl}${path}`;
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'manual',
        });

        if (response.status >= 200 && response.status < 300) {
            return { url, status: 'ok', statusCode: response.status };
        } else if (response.status >= 300 && response.status < 400) {
            return { url, status: 'redirect', statusCode: response.status };
        } else {
            return { url, status: 'error', statusCode: response.status };
        }
    } catch (error) {
        return { url, status: 'error', error: error.message };
    }
}

async function main() {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    console.log(`\n🔗 Link Checker - Validating routes on ${baseUrl}\n`);
    console.log('='.repeat(60));

    const results = [];

    // Check page routes
    console.log('\n📄 Checking Page Routes...\n');
    for (const route of ROUTES) {
        const result = await checkLink(baseUrl, route);
        results.push(result);

        const icon = result.status === 'ok' ? '✅' : result.status === 'redirect' ? '↪️' : '❌';
        console.log(`${icon} ${route} ${result.statusCode ? `(${result.statusCode})` : result.error || ''}`);
    }

    // Check API routes
    console.log('\n🔌 Checking API Routes...\n');
    for (const route of API_ROUTES) {
        const result = await checkLink(baseUrl, route);
        results.push(result);

        const icon = result.status === 'ok' ? '✅' : result.status === 'redirect' ? '↪️' : '❌';
        console.log(`${icon} ${route} ${result.statusCode ? `(${result.statusCode})` : result.error || ''}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    const okCount = results.filter(r => r.status === 'ok').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const redirectCount = results.filter(r => r.status === 'redirect').length;

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ OK: ${okCount}`);
    console.log(`   ↪️ Redirects: ${redirectCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   Total: ${results.length}\n`);

    if (errorCount > 0) {
        console.log('❌ Link check failed - some routes returned errors');
        process.exit(1);
    } else {
        console.log('✅ All links validated successfully!');
    }
}

main().catch(console.error);

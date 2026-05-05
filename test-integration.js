/**
 * Test Script for AI Agent Bob + Monday.com Integration
 * 
 * This script tests the integration by sending sample requests to the triage endpoint
 * and verifying that Monday.com tasks are created successfully.
 * 
 * Usage: node test-integration.js
 */

const http = require('http');

const API_URL = 'http://localhost:3000';

// Test cases
const testCases = [
    {
        name: 'Critical Bug Report',
        data: {
            type: 'issue',
            title: 'Database connection timeout in production',
            description: 'Users are experiencing timeout errors when trying to access the application. The database connection pool appears to be exhausted. This is affecting approximately 100+ users in the production environment.',
            priority: 'critical',
            context: 'Production environment, started 30 minutes ago, affecting all users'
        }
    },
    {
        name: 'High Priority Feature Request',
        data: {
            type: 'feature',
            title: 'Add two-factor authentication',
            description: 'Implement two-factor authentication (2FA) for enhanced security. Users should be able to enable 2FA using authenticator apps like Google Authenticator or receive codes via SMS.',
            priority: 'high',
            context: 'Security enhancement requested by multiple enterprise clients'
        }
    },
    {
        name: 'Medium Priority Bug',
        data: {
            type: 'issue',
            title: 'UI alignment issue on mobile devices',
            description: 'The navigation menu is not properly aligned on mobile devices with screen sizes below 375px. Buttons overlap and some menu items are not accessible.',
            priority: 'medium',
            context: 'Reported by 5 users on iOS devices'
        }
    }
];

function makeRequest(testCase) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(testCase.data);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/triage',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ testCase: testCase.name, result, statusCode: res.statusCode });
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('='.repeat(70));
    console.log('AI Agent Bob + Monday.com Integration Test');
    console.log('='.repeat(70));
    console.log();

    // Check if server is running
    console.log('Checking if server is running...');
    try {
        await new Promise((resolve, reject) => {
            const req = http.get(`${API_URL}/health`, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ Server is running\n');
                    resolve();
                } else {
                    reject(new Error('Server returned non-200 status'));
                }
            });
            req.on('error', reject);
        });
    } catch (error) {
        console.error('❌ Server is not running!');
        console.error('Please start the server with: node server.js');
        process.exit(1);
    }

    console.log(`Running ${testCases.length} test cases...\n`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`Test ${i + 1}/${testCases.length}: ${testCase.name}`);
        console.log('-'.repeat(70));

        try {
            const { result, statusCode } = await makeRequest(testCase);

            if (statusCode === 200 && result.success) {
                console.log('✅ Triage Analysis: SUCCESS');
                console.log(`   Tracking ID: ${result.analysis.tracking_id}`);
                console.log(`   Type: ${result.analysis.type}`);
                console.log(`   Priority: ${result.analysis.priority}`);
                console.log(`   Complexity: ${result.analysis.complexity}`);
                console.log(`   Estimated Effort: ${result.analysis.estimated_effort}`);

                if (result.analysis.monday_task) {
                    if (result.analysis.monday_task.created) {
                        console.log('✅ Monday.com Task: CREATED');
                        console.log(`   Task ID: ${result.analysis.monday_task.task_id}`);
                        console.log(`   Task URL: ${result.analysis.monday_task.task_url}`);
                        successCount++;
                    } else {
                        console.log('⚠️  Monday.com Task: FAILED');
                        console.log(`   Error: ${result.analysis.monday_task.error}`);
                        failureCount++;
                    }
                } else {
                    console.log('⚠️  Monday.com Task: NOT ATTEMPTED');
                    failureCount++;
                }
            } else {
                console.log('❌ Request failed');
                console.log(`   Status: ${statusCode}`);
                console.log(`   Error: ${result.error || 'Unknown error'}`);
                failureCount++;
            }
        } catch (error) {
            console.log('❌ Test failed with error:');
            console.log(`   ${error.message}`);
            failureCount++;
        }

        console.log();
    }

    // Summary
    console.log('='.repeat(70));
    console.log('Test Summary');
    console.log('='.repeat(70));
    console.log(`Total Tests: ${testCases.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log();

    if (successCount === testCases.length) {
        console.log('🎉 All tests passed! Integration is working correctly.');
        console.log('Check your Monday.com board to see the created tasks.');
    } else if (successCount > 0) {
        console.log('⚠️  Some tests failed. Check the errors above.');
        console.log('Partial integration success - some tasks were created.');
    } else {
        console.log('❌ All tests failed. Please check:');
        console.log('   1. Server is running (node server.js)');
        console.log('   2. Python is installed and accessible');
        console.log('   3. Monday.com API token is valid');
        console.log('   4. Python requests library is installed (pip install requests)');
    }
    console.log();
}

// Run tests
runTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

// Made with Bob

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configuration
const MONDAY_SCRIPT_PATH = path.join(__dirname, 'services', 'monday-integration.py');

// Bob Triage Engine - NLP Parsing and Issue Understanding
class BobTriageEngine {
    constructor() {
        this.nlpKeywords = {
            issue: ['bug', 'error', 'crash', 'broken', 'not working', 'fails', 'issue', 'problem', 'defect'],
            feature: ['add', 'new', 'feature', 'enhancement', 'improve', 'support', 'implement', 'create'],
            priority: {
                critical: ['critical', 'urgent', 'blocker', 'production down', 'security'],
                high: ['high', 'important', 'major', 'significant'],
                medium: ['medium', 'moderate', 'normal'],
                low: ['low', 'minor', 'trivial', 'nice to have']
            }
        };
    }

    // NLP Parsing - Analyze and understand the input
    parseInput(data) {
        const { type, title, description, priority, context } = data;
        const fullText = `${title} ${description} ${context || ''}`.toLowerCase();

        // Extract key information
        const analysis = {
            type: type,
            title: title,
            priority: priority,
            tracking_id: this.generateTrackingId(type),
            nlp_understanding: '',
            insights: [],
            recommendations: [],
            estimated_effort: '',
            sentiment: this.analyzeSentiment(fullText),
            keywords: this.extractKeywords(fullText),
            complexity: this.assessComplexity(description)
        };

        // Generate NLP understanding
        analysis.nlp_understanding = this.generateUnderstanding(data, fullText);

        // Generate insights
        analysis.insights = this.generateInsights(data, fullText);

        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(data, analysis);

        // Estimate effort
        analysis.estimated_effort = this.estimateEffort(analysis);

        return analysis;
    }

    generateTrackingId(type) {
        const prefix = type === 'issue' ? 'ISS' : 'FTR';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(2).toString('hex').toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    generateUnderstanding(data, fullText) {
        const { type, title, description } = data;

        if (type === 'issue') {
            const hasErrorMsg = /error|exception|failed/i.test(fullText);
            const hasSteps = /step|reproduce|when|after/i.test(fullText);

            let understanding = `This appears to be a ${data.priority} priority bug report. `;

            if (hasErrorMsg) {
                understanding += 'The issue involves error messages or exceptions. ';
            }
            if (hasSteps) {
                understanding += 'Steps to reproduce have been provided. ';
            }

            understanding += `The core problem relates to: ${this.extractCoreProblem(description)}`;
            return understanding;
        } else {
            const hasUserBenefit = /user|customer|improve|better/i.test(fullText);
            const hasBusinessValue = /revenue|efficiency|productivity|cost/i.test(fullText);

            let understanding = `This is a ${data.priority} priority feature request. `;

            if (hasUserBenefit) {
                understanding += 'The feature focuses on user experience improvements. ';
            }
            if (hasBusinessValue) {
                understanding += 'There are clear business value indicators. ';
            }

            understanding += `The requested capability involves: ${this.extractCoreProblem(description)}`;
            return understanding;
        }
    }

    extractCoreProblem(text) {
        const firstSentence = text.split(/[.!?]/)[0];
        return firstSentence.length > 100 ? firstSentence.substring(0, 100) + '...' : firstSentence;
    }

    generateInsights(data, fullText) {
        const insights = [];
        const { type, description, priority } = data;

        if (type === 'issue') {
            if (/mobile|ios|android/i.test(fullText)) {
                insights.push('Mobile platform specific issue detected');
            }
            if (/browser|chrome|firefox|safari/i.test(fullText)) {
                insights.push('Browser compatibility issue identified');
            }
            if (/performance|slow|timeout/i.test(fullText)) {
                insights.push('Performance-related concern detected');
            }
            if (/security|vulnerability|exploit/i.test(fullText)) {
                insights.push('⚠️ Security implications identified - requires immediate attention');
            }
            if (/data loss|corruption/i.test(fullText)) {
                insights.push('⚠️ Data integrity concern - high priority');
            }
        } else {
            if (/ui|ux|interface|design/i.test(fullText)) {
                insights.push('UI/UX enhancement requested');
            }
            if (/api|integration|webhook/i.test(fullText)) {
                insights.push('API or integration feature identified');
            }
            if (/automation|workflow/i.test(fullText)) {
                insights.push('Automation opportunity detected');
            }
            if (/analytics|reporting|dashboard/i.test(fullText)) {
                insights.push('Data visualization or reporting feature');
            }
        }

        if (description.length > 500) {
            insights.push('Detailed description provided - well-documented request');
        }

        if (priority === 'critical' || priority === 'high') {
            insights.push(`High priority ${type} - should be addressed in current sprint`);
        }

        if (insights.length === 0) {
            insights.push(`Standard ${type} request requiring standard triage process`);
        }

        return insights;
    }

    generateRecommendations(data, analysis) {
        const recommendations = [];
        const { type, priority } = data;

        if (priority === 'critical') {
            recommendations.push('Assign to senior developer immediately');
            recommendations.push('Schedule emergency deployment if needed');
            recommendations.push('Notify stakeholders and provide regular updates');
        } else if (priority === 'high') {
            recommendations.push('Include in current sprint planning');
            recommendations.push('Assign to experienced team member');
        } else if (priority === 'medium') {
            recommendations.push('Add to product backlog for next sprint');
            recommendations.push('Gather additional requirements if needed');
        } else {
            recommendations.push('Add to backlog for future consideration');
            recommendations.push('Evaluate against other priorities');
        }

        if (type === 'issue') {
            recommendations.push('Create test cases to prevent regression');
            recommendations.push('Document root cause analysis');
            if (analysis.keywords.includes('security')) {
                recommendations.push('⚠️ Conduct security review before deployment');
            }
        } else {
            recommendations.push('Create technical design document');
            recommendations.push('Estimate development effort and timeline');
            recommendations.push('Consider impact on existing features');
        }

        return recommendations;
    }

    estimateEffort(analysis) {
        const { complexity, priority, type } = analysis;

        let effort = '';

        if (complexity === 'high') {
            effort = '5-8 days (Complex implementation required)';
        } else if (complexity === 'medium') {
            effort = '2-4 days (Moderate complexity)';
        } else {
            effort = '1-2 days (Low complexity)';
        }

        if (type === 'issue' && (priority === 'critical' || priority === 'high')) {
            effort += ' - Fast-track recommended';
        }

        return effort;
    }

    assessComplexity(description) {
        const length = description.length;
        const hasMultipleAspects = (description.match(/and|also|additionally|furthermore/gi) || []).length > 2;
        const hasTechnicalTerms = /api|database|authentication|integration|algorithm/i.test(description);

        if (length > 500 || (hasMultipleAspects && hasTechnicalTerms)) {
            return 'high';
        } else if (length > 200 || hasMultipleAspects || hasTechnicalTerms) {
            return 'medium';
        }
        return 'low';
    }

    analyzeSentiment(text) {
        const negativeWords = ['broken', 'crash', 'error', 'fail', 'bug', 'issue', 'problem'];
        const positiveWords = ['improve', 'enhance', 'better', 'great', 'excellent'];

        let score = 0;
        negativeWords.forEach(word => {
            if (text.includes(word)) score--;
        });
        positiveWords.forEach(word => {
            if (text.includes(word)) score++;
        });

        return score < 0 ? 'negative' : score > 0 ? 'positive' : 'neutral';
    }

    extractKeywords(text) {
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const wordFreq = {};

        words.forEach(word => {
            if (word.length > 3 && !commonWords.includes(word)) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        return Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }

    // Create Monday.com task from triage analysis
    async createMondayTask(triageData) {
        return new Promise((resolve, reject) => {
            console.log('📋 Creating Monday.com task...');

            const mondayData = {
                type: triageData.type,
                title: triageData.title,
                description: triageData.description,
                priority: triageData.priority,
                tracking_id: triageData.tracking_id
            };

            const pythonProcess = spawn('python', [`"${MONDAY_SCRIPT_PATH}"`], {
                shell: true,
                windowsHide: true
            });

            let output = '';
            let errorOutput = '';
            let jsonResult = null;

            pythonProcess.stdin.write(JSON.stringify(mondayData));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on('data', (data) => {
                const dataStr = data.toString();
                output += dataStr;

                const jsonMatch = dataStr.match(/\{[\s\S]*"success"[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        jsonResult = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        // Continue collecting output
                    }
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0 && jsonResult) {
                    console.log('✅ Monday.com task created successfully');
                    console.log(`   Task ID: ${jsonResult.item_id}`);
                    console.log(`   URL: ${jsonResult.board_url}`);
                    resolve(jsonResult);
                } else {
                    const error = new Error(errorOutput || 'Failed to create Monday.com task');
                    console.log('⚠️ Monday.com task creation failed:', error.message);
                    reject(error);
                }
            });

            pythonProcess.on('error', (error) => {
                console.log('⚠️ Could not execute Python script:', error.message);
                reject(error);
            });
        });
    }
}

// Initialize Bob Triage Engine
const bobEngine = new BobTriageEngine();

// Main triage endpoint
app.post('/api/triage', async (req, res) => {
    const { type, title, description, priority, context } = req.body;

    if (!type || !title || !description) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: type, title, and description are required'
        });
    }

    if (!['issue', 'feature'].includes(type)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid type. Must be either "issue" or "feature"'
        });
    }

    console.log(`\n🔍 Bob Triage Engine - Processing ${type.toUpperCase()}`);
    console.log(`Title: ${title}`);
    console.log(`Priority: ${priority}`);

    try {
        const analysis = bobEngine.parseInput(req.body);
        console.log(`✅ Analysis complete - Tracking ID: ${analysis.tracking_id}`);

        // Create Monday.com task
        let mondayTask = null;
        try {
            mondayTask = await bobEngine.createMondayTask({
                type: type,
                title: title,
                description: description,
                priority: priority || 'medium',
                tracking_id: analysis.tracking_id
            });

            analysis.monday_task = {
                created: true,
                task_id: mondayTask.item_id,
                task_url: mondayTask.board_url
            };
        } catch (mondayError) {
            console.log('⚠️ Monday.com integration failed:', mondayError.message);
            analysis.monday_task = {
                created: false,
                error: mondayError.message
            };
        }

        res.json({
            success: true,
            analysis: analysis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error during triage:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Bob Triage Engine + Monday.com Integration',
        version: '2.0.0',
        features: ['NLP Parsing', 'Issue Understanding', 'Automated Triage', 'Monday.com Integration'],
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 BOB TRIAGE ENGINE + MONDAY.COM INTEGRATION');
    console.log('='.repeat(60));
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Frontend: http://localhost:${PORT}`);
    console.log(`🔍 Triage API: POST http://localhost:${PORT}/api/triage`);
    console.log(`💚 Health Check: GET http://localhost:${PORT}/api/health`);
    console.log('\n🧠 Features:');
    console.log('   • NLP Parsing & Analysis');
    console.log('   • Issue Understanding');
    console.log('   • Automated Recommendations');
    console.log('   • Effort Estimation');
    console.log('   • Monday.com Integration');
    console.log('='.repeat(60) + '\n');
});

module.exports = app;

// Made with Bob

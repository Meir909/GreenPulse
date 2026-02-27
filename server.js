// Simple Express server for GreenPulse
// Скрывает OpenAI API ключ на backend
// Use: node server.js

const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API endpoint for AI analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'OpenAI API key not configured. Set OPENAI_API_KEY in .env file'
            });
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты эксперт в области очистки воды и мониторинга качества воды. Предоставляй подробные, практические и полезные анализы и рекомендации.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        res.json({ content });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to process request'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 GreenPulse server is running at http://localhost:${PORT}`);
    console.log(`📊 Open http://localhost:${PORT} in your browser`);
    console.log(`\n⚠️  Make sure you have OPENAI_API_KEY in your .env file`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📴 Server shutting down...');
    process.exit(0);
});

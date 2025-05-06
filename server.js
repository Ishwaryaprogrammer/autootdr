const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // Serve frontend files
const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore();

// Initialize Firebase
const serviceAccount = require('./firebase-config.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// API Route to Start an OTDR Test
app.post('/api/start-test', async (req, res) => {
    const testData = {
        status: 'Initialization',
        timestamp: new Date().toISOString(),
        range: "20 km",
        pulse_width: "10 ns",
        fiber_length: "18.5 km",
        attenuation: "0.2 dB/km",
        events: [],
        trace_data: []
    };
    const docRef = await db.collection('otdr_tests').add(testData);
    res.json({ message: 'Test Started', test_id: docRef.id });
});

// API Route to Fetch Test Results
app.get('/api/test-results', async (req, res) => {
    const snapshot = await db.collection('otdr_tests').get();
    let results = [];
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
    res.json(results);
});

// Serve the HTML file on root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

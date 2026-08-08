const { Query } = require('node-appwrite');
const { databases } = require('../utils/dbHelper');

// Get all submissions for table view
const getSubmissions = async (req, res) => {
    try {
        const dbId = process.env.APPWRITE_DB_ID;
        const resumesCol = process.env.APPWRITE_RESUMES_COL;

        const response = await databases.listDocuments(
            dbId,
            resumesCol,
            [
                Query.orderDesc('createdAt'),
                Query.limit(1000)
            ]
        );

        // Normalize Appwrite documents to include clean ID and fallbacks
        const documents = response.documents.map(doc => {
            let parsedAts = {};
            if (doc.atsData) {
                try {
                    parsedAts = typeof doc.atsData === 'string' ? JSON.parse(doc.atsData) : doc.atsData;
                } catch (e) {
                    console.error('Failed to parse atsData for resume', doc.$id, e);
                }
            }
            return {
                id: doc.$id,
                userName: doc.userName || 'Anonymous',
                userEmail: doc.userEmail || '',
                userMobile: doc.userMobile || '',
                degree: doc.degree || '',
                department: doc.department || '',
                college: doc.college || '',
                graduationYear: doc.graduationYear || '',
                currentStatus: doc.currentStatus || '',
                targetRole: doc.targetRole || '',
                company: doc.company || '',
                jobDescription: doc.jobDescription || '',
                fileName: doc.fileName || '',
                fileUrl: doc.fileUrl || '',
                overallScore: doc.overallScore != null ? Number(doc.overallScore) : 0,
                createdAt: doc.createdAt || doc.$createdAt || new Date().toISOString(),
                atsData: parsedAts
            };
        });

        res.json({ success: true, documents });
    } catch (error) {
        console.error('Error fetching submissions in adminController:', error);
        res.status(500).json({ error: 'Failed to retrieve submissions', details: error.message });
    }
};

// Get aggregated statistics for charts & summaries
const getStats = async (req, res) => {
    try {
        const dbId = process.env.APPWRITE_DB_ID;
        const resumesCol = process.env.APPWRITE_RESUMES_COL;

        const response = await databases.listDocuments(
            dbId,
            resumesCol,
            [
                Query.limit(1000)
            ]
        );

        const documents = response.documents.map(doc => ({
            id: doc.$id,
            userName: doc.userName || 'Anonymous',
            userEmail: doc.userEmail || '',
            userMobile: doc.userMobile || '',
            overallScore: doc.overallScore != null ? Number(doc.overallScore) : 0,
            createdAt: doc.createdAt || doc.$createdAt || new Date().toISOString()
        }));

        const totalResumes = documents.length;

        // Group by email to count unique candidate profiles
        const uniqueEmails = new Set(documents.map(d => d.userEmail.trim().toLowerCase()).filter(Boolean));
        const totalUsers = uniqueEmails.size || totalResumes;

        // Compute average score
        const totalScore = documents.reduce((sum, doc) => sum + doc.overallScore, 0);
        const avgScore = totalResumes > 0 ? Math.round(totalScore / totalResumes) : 0;

        // Compute uploads today (using local timezone date comparison)
        const todayStr = new Date().toDateString();
        const todayCount = documents.filter(doc => new Date(doc.createdAt).toDateString() === todayStr).length;

        // Compute Upload Activity (Last 7 Days)
        const uploadActivityMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
            uploadActivityMap[label] = 0;
        }

        documents.forEach(doc => {
            const label = new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
            if (uploadActivityMap[label] !== undefined) {
                uploadActivityMap[label]++;
            }
        });

        const uploadsByDate = Object.entries(uploadActivityMap).map(([date, count]) => ({
            date,
            uploads: count
        }));

        // Compute Score Distribution Ranges
        const ranges = {
            '0–40': 0,
            '40–60': 0,
            '60–75': 0,
            '75–90': 0,
            '90+': 0
        };

        documents.forEach(doc => {
            const score = doc.overallScore;
            if (score < 40) ranges['0–40']++;
            else if (score < 60) ranges['40–60']++;
            else if (score < 75) ranges['60–75']++;
            else if (score < 90) ranges['75–90']++;
            else ranges['90+']++;
        });

        const scoreRanges = Object.entries(ranges).map(([name, value]) => ({
            name,
            value
        }));

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalResumes,
                avgScore,
                todayCount,
                uploadsByDate,
                scoreRanges
            }
        });
    } catch (error) {
        console.error('Error compiling statistics in adminController:', error);
        res.status(500).json({ error: 'Failed to compile statistics', details: error.message });
    }
};

module.exports = {
    getSubmissions,
    getStats
};

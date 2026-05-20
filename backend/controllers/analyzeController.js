const pdfParse = require('pdf-parse');
const { Groq } = require('groq-sdk');
const { Client, Storage, ID } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');

// ─── Appwrite Storage Client (server-side) ────────────────────────────────────
const appwriteClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);         // Server API Key

const appwriteStorage = new Storage(appwriteClient);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Upload buffer to Appwrite Storage ───────────────────────────────────────
const uploadToAppwrite = async (buffer, filename) => {
    const file = await appwriteStorage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        InputFile.fromBuffer(buffer, filename),
    );
    // Construct public view URL (works if bucket has "Any → Read" permission)
    const fileUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
    return { fileId: file.$id, fileUrl };
};

// ═══════════════════════════════════════════════════════════════════════════════
//  DETERMINISTIC ATS SCORING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

function stem(word) {
    return word
        .toLowerCase()
        .replace(/(?:ing|tion|tions|ed|er|ers|ly|ment|ments|ness|ful|less|ize|ise|ized|isation|ization|able|ible|al|ial|ous|ious|ive|ative|itive|ent|ant|ence|ance)$/, '')
        .replace(/ies$/, 'y')
        .replace(/([^aeiou])ies$/, '$1y')
        .replace(/([^aeiou])es$/, '$1')
        .replace(/([^aeiou])s$/, '$1');
}

function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\-\s]/g, ' ')
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length >= 2);
}

const STOP_WORDS = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'is','are','was','were','be','been','have','has','had','do','does','did',
    'will','would','could','should','may','might','shall','can','this','that',
    'these','those','it','its','we','our','you','your','they','their','i','my',
    'he','she','him','her','us','them','what','which','who','how','when','where',
    'if','then','than','as','by','from','up','about','into','through','during',
    'including','until','against','among','throughout','across','behind','within',
    'without','before','after','above','below','between','each','every','both',
    'few','more','most','other','some','such','no','not','only','own','same',
    'so','too','very','just','here','there','all','any','also','well','per',
]);

function extractKeywords(words) {
    return [...new Set(words.filter(w => w.length >= 3 && !STOP_WORDS.has(w)))];
}

const SKILLS_DB = [
    'python','javascript','typescript','java','c++','c#','ruby','go','golang',
    'rust','kotlin','swift','php','scala','r','matlab','perl','bash','shell',
    'react','reactjs','angular','vue','vuejs','nextjs','nodejs','express',
    'django','flask','fastapi','spring','laravel','rails','html','css','sass',
    'tailwind','bootstrap','jquery','graphql','rest','api','restful','webpack',
    'vite','redux','mobx','zustand',
    'machine learning','deep learning','nlp','tensorflow','pytorch','keras',
    'scikit','pandas','numpy','matplotlib','seaborn','sql','mysql','postgresql',
    'mongodb','redis','elasticsearch','spark','hadoop','airflow','dbt',
    'tableau','powerbi','excel',
    'aws','azure','gcp','docker','kubernetes','terraform','ansible','jenkins',
    'ci/cd','github actions','linux','nginx','apache','git','github','gitlab',
    'bitbucket','jira','confluence','agile','scrum','devops','microservices',
    'android','ios','flutter','react native','xamarin',
    'figma','photoshop','illustrator','ux','ui','product management','leadership',
    'communication','teamwork','problem solving','critical thinking',
];

function extractSkills(text) {
    const lower = text.toLowerCase();
    return SKILLS_DB.filter(skill => {
        const escaped = skill.replace(/[+#.]/g, '\\$&');
        return new RegExp(`\\b${escaped}\\b`).test(lower);
    });
}

function overlap(a, b) {
    if (!a.length) return 0;
    const bSet = new Set(b.map(x => x.toLowerCase()));
    return a.filter(x => bSet.has(x.toLowerCase())).length / a.length;
}

function checkExperience(resumeText, jobDescription) {
    const resumeLower = resumeText.toLowerCase();
    const jdLower = (jobDescription || '').toLowerCase();
    let score = 0.5;
    const jdYearsMatch  = jdLower.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience)?/);
    const resumeYearsMatch = resumeLower.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience)?/);
    const jdYears = jdYearsMatch    ? parseInt(jdYearsMatch[1])    : null;
    const resumeYears = resumeYearsMatch ? parseInt(resumeYearsMatch[1]) : null;
    if (jdYears && resumeYears) {
        if (resumeYears >= jdYears)                         score = 1.0;
        else if (resumeYears >= jdYears - 1)                score = 0.75;
        else if (resumeYears >= Math.floor(jdYears / 2))    score = 0.5;
        else                                                 score = 0.25;
    } else if (resumeYears) { score = 0.7; }
    const terms = ['entry','junior','mid','senior','lead','principal','staff','architect','manager','director'];
    const jdLevel     = terms.find(t => jdLower.includes(t));
    const resumeLevel = terms.find(t => resumeLower.includes(t));
    if (jdLevel && resumeLevel) {
        score = jdLevel === resumeLevel ? Math.min(score + 0.2, 1.0) : Math.max(score - 0.1, 0);
    }
    return score;
}

function checkFormat(resumeText) {
    const lower = resumeText.toLowerCase();
    const checks = [
        /\d+%|\d+\s*(?:users?|customers?|projects?|teams?|employees?|clients?)/.test(lower),
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(lower),
        /[\+\d][\d\s\-().]{7,}/.test(resumeText),
        (() => { const wc = resumeText.split(/\s+/).length; return wc >= 200 && wc <= 2000; })(),
        /\b(?:developed|built|designed|implemented|managed|led|created|improved|increased|reduced|optimized|delivered|launched|collaborated|architected)\b/.test(lower),
        /\b(?:20\d{2}|19\d{2})\b/.test(resumeText),
        resumeText.length >= 300,
        /linkedin|github/.test(lower),
    ];
    return checks.filter(Boolean).length / checks.length;
}

function calcATSScore(resume, jobDescription) {
    const resumeWords = tokenize(resume);
    const jdWords = tokenize(jobDescription || '');

    let keywordScore = 0;
    if (jdWords.length > 0) {
        const jdKeywords = extractKeywords(jdWords);
        if (jdKeywords.length > 0) {
            const stemmedResume = resumeWords.map(stem);
            const matched = jdKeywords.filter(kw => stemmedResume.includes(stem(kw)));
            keywordScore = matched.length / jdKeywords.length;
        }
    } else {
        keywordScore = Math.min(extractKeywords(resumeWords).length / 80, 1.0);
    }

    const resumeSkills = extractSkills(resume);
    let skillsScore = 0;
    if (jobDescription && jobDescription.trim().length > 0) {
        const requiredSkills = extractSkills(jobDescription);
        skillsScore = requiredSkills.length > 0
            ? overlap(requiredSkills, resumeSkills)
            : Math.min(resumeSkills.length / 10, 1.0);
    } else {
        skillsScore = Math.min(resumeSkills.length / 10, 1.0);
    }

    const expScore     = checkExperience(resume, jobDescription);
    const sections     = ['experience', 'education', 'skills', 'contact'];
    const lower        = resume.toLowerCase();
    const sectionScore = sections.filter(s => lower.includes(s)).length / sections.length;
    const formatScore  = checkFormat(resume);

    const raw = Math.round(
        keywordScore * 35 +
        skillsScore  * 25 +
        expScore     * 20 +
        sectionScore * 12 +
        formatScore  *  8
    );
    return {
        score: Math.max(0, Math.min(100, raw)),
        breakdown: {
            keywordMatch: Math.round(keywordScore * 100),
            skillsMatch:  Math.round(skillsScore  * 100),
            experience:   Math.round(expScore      * 100),
            sections:     Math.round(sectionScore  * 100),
            format:       Math.round(formatScore   * 100),
        },
        resumeSkills,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const analyzeResume = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No resume file uploaded' });

        const { jobDescription, targetRole, company, payScale, experienceLevel } = req.body;

        // 1. Parse PDF
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        // 2. Upload to Appwrite Storage
        const safeName = req.file.originalname.replace(/\s+/g, '_');
        const { fileId, fileUrl } = await uploadToAppwrite(req.file.buffer, safeName);

        // 3. Run deterministic ATS algorithm
        const { score: algoScore, breakdown, resumeSkills } = calcATSScore(resumeText, jobDescription);

        // 4. AI qualitative analysis
        let prompt = `You are a senior ATS (Applicant Tracking System) expert.\n`;
        prompt += `A deterministic algorithm calculated an ATS score of ${algoScore}/100 for this resume`;
        if (targetRole) prompt += ` for the role: "${targetRole}"`;
        if (company)    prompt += ` at "${company}"`;
        prompt += `.\n`;
        if (jobDescription) prompt += `Job Description:\n${jobDescription.substring(0, 1500)}\n\n`;
        prompt += `Resume Text:\n${resumeText.substring(0, 4000)}\n\n`;
        prompt += `Provide your own score estimate and qualitative feedback.
Return ONLY a raw JSON object (no markdown, no backticks) with exactly this structure:
{
  "aiScore": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "keywordMatchScore": <number 0-100>,
  "missingSkills": ["skill1", "skill2"],
  "sectionAnalysis": {
    "education": "analysis text",
    "skills": "analysis text",
    "experience": "analysis text",
    "projects": "analysis text"
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "roleRecommendations": ["role1", "role2", "role3"]
}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
        });

        let jsonStr = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
        if (jsonStr.startsWith('```'))     jsonStr = jsonStr.slice(3);
        if (jsonStr.endsWith('```'))       jsonStr = jsonStr.slice(0, -3);

        const aiResult = JSON.parse(jsonStr.trim());

        // 5. Blend scores (algorithm 70% + AI 30%)
        const aiScore    = Math.max(0, Math.min(100, Number(aiResult.aiScore) || algoScore));
        const finalScore = Math.round(algoScore * 0.7 + aiScore * 0.3);

        // 6. Merge missing skills
        const aiMissing   = Array.isArray(aiResult.missingSkills) ? aiResult.missingSkills : [];
        const algoMissing = jobDescription ? extractSkills(jobDescription).filter(s => !resumeSkills.includes(s)) : [];
        const allMissing  = [...new Set([...algoMissing, ...aiMissing])].slice(0, 12);

        res.json({
            success: true,
            fileUrl,
            fileId,
            data: {
                overallScore:        finalScore,
                algoScore,
                aiScore,
                scoreBreakdown:      breakdown,
                readabilityScore:    Math.max(0, Math.min(100, Number(aiResult.readabilityScore) || 70)),
                keywordMatchScore:   breakdown.keywordMatch,
                missingSkills:       allMissing,
                sectionAnalysis:     aiResult.sectionAnalysis || {},
                suggestions:         Array.isArray(aiResult.suggestions) ? aiResult.suggestions : [],
                roleRecommendations: Array.isArray(aiResult.roleRecommendations) ? aiResult.roleRecommendations : [],
            },
        });

    } catch (error) {
        console.error('Error in analyzeResume:', error);
        res.status(500).json({ error: 'Failed to analyze resume', details: error.message });
    }
};

module.exports = { analyzeResume };

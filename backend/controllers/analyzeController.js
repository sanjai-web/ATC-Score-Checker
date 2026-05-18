const pdfParse = require('pdf-parse');
const { Groq } = require('groq-sdk');
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',   // 'image' type supports PDFs and serves with
                                          // Content-Type: application/pdf so browsers open them
                folder: 'ats_resumes',
                public_id: filename,
                format: 'pdf',            // Ensure stored as PDF
                use_filename: true,
                unique_filename: false
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        // Pipe buffer into Cloudinary upload stream
        const readableStream = Readable.from(buffer);
        readableStream.pipe(uploadStream);
    });
};

const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        const { jobDescription, targetRole, industry, experienceLevel } = req.body;

        // 1. Parse PDF text
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        // 2. Upload resume to Cloudinary
        const safeName = req.file.originalname.replace(/\s+/g, '_').replace(/\.pdf$/i, '');
        const uniqueFilename = `${Date.now()}_${safeName}`;
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, uniqueFilename);
        const fileUrl = cloudinaryResult.secure_url; // Cloudinary image-type gives correct URL

        // 3. Build AI Prompt
        let prompt = `You are an expert ATS (Applicant Tracking System). Analyze the following resume text. `;
        if (targetRole || jobDescription) {
            prompt += `Compare it against the target role: "${targetRole}" and job description: "${jobDescription}". `;
            prompt += `Industry: "${industry}", Experience Level: "${experienceLevel}". `;
        }

        prompt += `
Return a raw JSON object (and nothing else, no markdown formatting, no backticks) with exactly this structure:
{
  "overallScore": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "keywordMatchScore": <number 0-100>,
  "missingSkills": ["skill1", "skill2"],
  "sectionAnalysis": {
    "education": "analysis text",
    "skills": "analysis text",
    "experience": "analysis text",
    "projects": "analysis text"
  },
  "suggestions": ["suggestion1", "suggestion2"],
  "roleRecommendations": ["role1", "role2"]
}

Resume Text:
${resumeText.substring(0, 5000)}
`;

        // 4. Get AI analysis from Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1
        });

        const responseText = chatCompletion.choices[0]?.message?.content;

        // 5. Clean up any markdown wrappers
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);

        const atsResult = JSON.parse(jsonStr.trim());

        // 6. Return both the score AND the Cloudinary URL to the frontend
        res.json({
            success: true,
            fileUrl,
            data: atsResult
        });

    } catch (error) {
        console.error('Error in analyzeResume:', error);
        res.status(500).json({ error: 'Failed to analyze resume', details: error.message });
    }
};

module.exports = { analyzeResume };

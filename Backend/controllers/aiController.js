import asyncHandler from "../middleware/asyncHandler.js";

// ────────────────────────────────────────
// POST /api/ai/interview-prep
// Generates interview questions from a job description
// Uses Google Gemini via REST if GEMINI_API_KEY is set,
// otherwise returns a rich set of static questions.
// ────────────────────────────────────────
export const interviewPrep = asyncHandler(async (req, res) => {
    const { jobTitle, company, description } = req.body;

    if (!jobTitle) {
        res.status(400);
        throw new Error("Job title is required");
    }

    const context = `Job Title: ${jobTitle}\nCompany: ${company || "Unknown"}\nJob Description: ${description || "Not provided"}`;

    // ── Try Gemini API ───────────────────
    if (process.env.GEMINI_API_KEY) {
        try {
            const prompt = `You are an expert career coach. Based on the following job details, generate exactly 8 tailored interview questions. For each question, also provide a brief tip on how to answer it well.

${context}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "category": "Technical|Behavioral|Situational|Company Fit",
    "question": "...",
    "tip": "..."
  }
]`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
                    }),
                }
            );

            if (response.ok) {
                const geminiData = await response.json();
                const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                const jsonMatch = rawText.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const questions = JSON.parse(jsonMatch[0]);
                    return res.json({
                        success: true,
                        source: "ai",
                        jobTitle,
                        company,
                        questions,
                    });
                }
            }
        } catch (err) {
            // Fall through to static questions
            console.warn("Gemini API failed, using static questions:", err.message);
        }
    }

    // ── Fallback: curated smart questions ─
    const staticQuestions = [
        {
            category: "Behavioral",
            question: `Tell me about yourself and why you're interested in the ${jobTitle} role at ${company || "this company"}.`,
            tip: "Use the STAR method (Situation, Task, Action, Result). Tailor your story to highlight skills relevant to this role.",
        },
        {
            category: "Behavioral",
            question: "Describe a time when you had to meet a tight deadline. How did you manage it?",
            tip: "Focus on prioritization, communication, and the outcome. Show that you can work under pressure without sacrificing quality.",
        },
        {
            category: "Situational",
            question: `Imagine you are new to ${company || "the company"} and your manager is on leave. You encounter a critical issue. What do you do?`,
            tip: "Demonstrate initiative, problem-solving, and knowing when to escalate. Show that you can own a problem.",
        },
        {
            category: "Technical",
            question: `What are the most important technical skills for a ${jobTitle} and how have you applied them in past projects?`,
            tip: "Give concrete examples with measurable outcomes. Align your skills with the keywords from the job description.",
        },
        {
            category: "Technical",
            question: "Walk me through a complex project you worked on from start to finish. What was your role?",
            tip: "Be specific about your individual contribution vs. the team. Highlight challenges and how you overcame them.",
        },
        {
            category: "Company Fit",
            question: `Why do you want to work at ${company || "this company"} specifically? What do you know about us?`,
            tip: "Research the company's mission, products, culture, and recent news. Show genuine enthusiasm and alignment with their values.",
        },
        {
            category: "Behavioral",
            question: "Tell me about a conflict you had with a teammate. How did you handle it?",
            tip: "Stay professional. Focus on the resolution and what you learned. Avoid blaming others.",
        },
        {
            category: "Situational",
            question: `Where do you see yourself in 3 years, and how does the ${jobTitle} role fit into that plan?`,
            tip: "Show ambition while being realistic. Tie your growth to contributing more value to the company.",
        },
    ];

    res.json({
        success: true,
        source: "static",
        jobTitle,
        company,
        questions: staticQuestions,
    });
});

// ────────────────────────────────────────
// POST /api/ai/cover-letter
// Generates a cover letter from job details
// Uses Google Gemini via REST if GEMINI_API_KEY is set,
// otherwise returns a smart template.
// ────────────────────────────────────────
export const generateCoverLetter = asyncHandler(async (req, res) => {
    const { jobTitle, company, description, skills, tone } = req.body;

    if (!jobTitle || !company) {
        res.status(400);
        throw new Error("Job title and company are required");
    }

    const toneStyle = tone || "Professional";
    const context = `Job Title: ${jobTitle}\nCompany: ${company}\nJob Description: ${description || "Not provided"}\nCandidate Skills: ${skills || "Not provided"}\nTone: ${toneStyle}`;

    // ── Try Gemini API ───────────────────
    if (process.env.GEMINI_API_KEY) {
        try {
            const prompt = `You are an expert career coach and professional writer. Write a compelling cover letter for the following job application. The letter should be ${toneStyle.toLowerCase()} in tone.

${context}

Write a complete cover letter that:
1. Opens with an attention-grabbing introduction
2. Highlights relevant skills and experience
3. Shows knowledge of the company
4. Explains why the candidate is a great fit
5. Closes with a confident call to action

Return ONLY the cover letter text, no additional commentary. Do not include placeholder brackets like [Your Name] - write it generically so the user can add their details. Start with "Dear Hiring Manager," and end with "Sincerely,".`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.8, maxOutputTokens: 2000 },
                    }),
                }
            );

            if (response.ok) {
                const geminiData = await response.json();
                const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (rawText.trim()) {
                    return res.json({
                        success: true,
                        source: "ai",
                        jobTitle,
                        company,
                        tone: toneStyle,
                        coverLetter: rawText.trim(),
                    });
                }
            }
        } catch (err) {
            console.warn("Gemini API failed for cover letter, using template:", err.message);
        }
    }

    // ── Fallback: smart template ─────────
    const skillsList = skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : ["problem-solving", "communication", "teamwork"];
    const skillsText = skillsList.length > 2
        ? `${skillsList.slice(0, -1).join(", ")}, and ${skillsList[skillsList.length - 1]}`
        : skillsList.join(" and ");

    const templateCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background in ${skillsText}, I am confident in my ability to make meaningful contributions to your team.

${description ? `After carefully reviewing the job description, I was particularly drawn to this opportunity because it aligns perfectly with my professional experience and career aspirations. The responsibilities outlined resonate with my passion for delivering high-quality results in dynamic environments.` : `I have been following ${company}'s growth and innovation with great admiration, and I am excited about the opportunity to contribute to your continued success.`}

Throughout my career, I have developed strong expertise in ${skillsText}. I have consistently demonstrated the ability to tackle complex challenges, collaborate effectively with cross-functional teams, and deliver results that exceed expectations. My approach combines technical excellence with strong communication skills, enabling me to thrive in both independent and team-oriented settings.

What excites me most about ${company} is the opportunity to bring my skills to a team that values innovation and excellence. I am eager to contribute my experience while continuing to grow professionally in an environment that fosters creativity and collaboration.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm align with the goals of your team. Thank you for considering my application. I look forward to the possibility of contributing to ${company}'s continued success.

Sincerely,
Your Name`;

    res.json({
        success: true,
        source: "template",
        jobTitle,
        company,
        tone: toneStyle,
        coverLetter: templateCoverLetter,
    });
});

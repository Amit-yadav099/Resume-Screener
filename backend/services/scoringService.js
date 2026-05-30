const { GoogleGenerativeAI } = require('@google/generative-ai');

async function scoreCandidate(resumeText, jdText) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      throw new Error("GEMINI_API_KEY not found or invalid.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert HR recruiter. I will provide you with a Job Description and a Candidate's Resume.
      Your task is to analyze them and provide a structured JSON response.
      Do not include any markdown formatting like \`\`\`json in your response, just the raw JSON object.
      
      Job Description:
      ${jdText.substring(0, 3000)} // Truncate to avoid token limits if extremely long

      Resume:
      ${resumeText.substring(0, 5000)}

      Return a JSON object with EXACTLY these keys:
      {
        "candidateName": "Extract the candidate's full name from the resume. If not found, return 'Unknown Candidate'",
        "matchScore": <An integer from 0 to 100 representing the overall fit>,
        "matchingSkills": ["Skill 1", "Skill 2"],
        "missingSkills": ["Skill 1", "Skill 2"]
      }
    `;

    let resultText = '';
    let retries = 3;
    let delay = 2000; // start with 2 seconds

    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        resultText = response.text();
        break; // Success, exit retry loop
      } catch (err) {
        if (err.status === 503 && retries > 1) {
          console.warn(`[503 Service Unavailable] High demand for gemini-3.5-flash. Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2; // Exponential backoff
        } else {
          throw err;
        }
      }
    }

    // In case the API returns markdown JSON blocks
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Scoring Error:", error);
    throw error;
  }
}

module.exports = { scoreCandidate };

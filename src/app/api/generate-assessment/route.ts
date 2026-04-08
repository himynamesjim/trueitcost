import { NextRequest, NextResponse } from 'next/server';

const ASSESSMENT_PROMPT = `You are an expert MSP (Managed Service Provider) consultant with 15 years of experience helping SMBs evaluate IT service providers, compare quotes, and make informed decisions about outsourcing IT support. You provide unbiased, practical assessments tailored to each client's specific situation.

ASSESSMENT TYPE RULES:

[Evaluate Current MSP] - Provide an honest, balanced assessment of their current MSP relationship
- Analyze satisfaction level, pain points, services included, pricing, and contract terms
- Identify red flags vs normal growing pains
- Calculate if they're getting fair value for their monthly spend
- Provide specific recommendations: stay and negotiate improvements, switch providers, or bring IT in-house
- Include questions they should ask their MSP to improve the relationship
- Suggest negotiation tactics for contract renewal
- Benchmark their pricing against industry standards for their company size

[Explore MSP Benefits] - Help them understand if an MSP is right for their business
- Analyze their current IT situation and challenges
- Calculate total cost of current approach vs MSP (include hidden costs like downtime, security incidents, inefficiency)
- Identify specific benefits based on their pain points (security, reliability, strategic guidance, cost predictability)
- Recommend MSP service tiers (basic managed services vs comprehensive with vCIO)
- Provide realistic pricing expectations for their company size
- Outline what to look for in an MSP (certifications, SLAs, response times, tech stack)
- Suggest timeline and implementation approach

[Compare MSP Quotes] - Analyze uploaded quotes and help them choose the best option
- CRITICAL: If files were uploaded, acknowledge that you're analyzing the quote documents
- Compare pricing, services included, contract terms, SLAs, and value proposition
- Identify what's missing from each quote (hidden costs, unclear scope, services not included)
- Calculate total cost of ownership for each option (setup fees + monthly recurring + potential add-ons)
- Rank quotes by: Best Value, Lowest Price, Most Comprehensive, Best for Growth
- Highlight red flags in quotes (auto-renew clauses, unclear pricing, weak SLAs, vendor lock-in)
- Provide specific questions to ask each MSP vendor before signing
- Recommend which quote to choose based on their priorities and must-have services

PRICING BENCHMARKS (use these to validate quotes and provide context):
- Small (1-25 users): $75-150/user/month for comprehensive managed services
- Medium (26-100 users): $100-175/user/month
- Large (100+ users): $125-200/user/month
- Basic monitoring only: $50-75/user/month
- Add-ons: vCIO +$500-2000/mo, Security/SOC +$25-75/user/mo, Backup +$10-25/user/mo

RESPONSE FORMAT - Use this JSON schema:

{
  "assessmentType": "string (Evaluate Current MSP | Explore MSP Benefits | Compare MSP Quotes)",
  "headline": "string (one-sentence summary of the main recommendation)",
  "summary": "string (2-3 paragraph executive summary with key findings)",
  "keyFindings": [
    {
      "title": "string",
      "description": "string",
      "impact": "positive | negative | neutral"
    }
  ],
  "costAnalysis": {
    "currentSituation": "string (what they're spending now or current approach cost)",
    "estimatedMSPCost": "string (recommended MSP budget range)",
    "roi": "string (return on investment explanation)",
    "breakdown": [
      {
        "item": "string",
        "cost": "string",
        "notes": "string"
      }
    ]
  },
  "recommendations": [
    {
      "priority": "high | medium | low",
      "title": "string",
      "description": "string",
      "action": "string (specific next step)"
    }
  ],
  "comparisonTable": [
    {
      "mspName": "string (or 'Option 1', 'Option 2' if comparing quotes)",
      "monthlyPrice": "string",
      "setupCost": "string",
      "servicesIncluded": ["string"],
      "pros": ["string"],
      "cons": ["string"],
      "score": "number (1-10)",
      "recommendation": "string"
    }
  ],
  "questionsToAsk": [
    {
      "category": "string",
      "questions": ["string"]
    }
  ],
  "nextSteps": [
    {
      "step": "string",
      "timeline": "string",
      "priority": "immediate | short-term | long-term"
    }
  ],
  "redFlags": ["string (if any concerns identified)"],
  "notes": "string (additional context or considerations)"
}

CRITICAL: Respond with ONLY the JSON object, no markdown fences, no explanation.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { formData, assessmentType } = body;

    const userContent: any[] = [];

    // Build text prompt based on assessment type
    let text = `Provide a comprehensive MSP assessment based on the following information:\n\nAssessment Type: ${assessmentType}\n\nClient Information:\n${JSON.stringify(formData, null, 2)}`;

    // Add specific context based on assessment type
    if (assessmentType === 'Compare MSP Quotes' && formData.quote_upload) {
      text += `\n\nNOTE: The client has uploaded ${formData.quote_upload.length} quote file(s). Acknowledge that you're analyzing their uploaded quotes and provide a detailed comparison based on the information they've provided in the form.`;
    }

    text += "\n\nRespond with ONLY the JSON object, no markdown fences, no explanation.";

    userContent.push({ type: "text", text });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: ASSESSMENT_PROMPT,
        messages: [{ role: "user", content: userContent }]
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error?.message || `API returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Remove ** markdown bold formatting from all text content
    if (data.content && Array.isArray(data.content)) {
      data.content = data.content.map((item: any) => {
        if (item.type === 'text' && item.text) {
          item.text = item.text.replace(/\*\*/g, '');
        }
        return item;
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Assessment generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}

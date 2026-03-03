import { NextRequest, NextResponse } from 'next/server';

const CHAT_SYSTEM_PROMPT = `You are an expert MSP (Managed Service Provider) consultant with 15 years of experience helping SMBs evaluate IT service providers, understand MSP offerings, and make informed decisions about IT support.

Your role is to:
1. Answer questions about MSPs, pricing, services, and best practices
2. Help users understand their assessment results and recommendations
3. Provide guidance on modifying or improving their assessments
4. Explain technical concepts in simple terms
5. Offer actionable advice based on their specific situation

Key areas of expertise:
- MSP service models (comprehensive managed services, co-managed IT, break-fix)
- Typical MSP pricing ($75-200/user/month depending on services and company size)
- Core MSP services (help desk, monitoring, backup, security, vCIO)
- How to evaluate MSP quotes and contracts
- Red flags to watch for when choosing an MSP
- Questions to ask MSP vendors during evaluation
- Industry benchmarks and best practices
- Contract terms, SLAs, and service guarantees

Pricing benchmarks by company size:
- 1-25 users: $75-150/user/month for comprehensive managed services
- 26-100 users: $100-175/user/month
- 100+ users: $125-200/user/month
- Basic monitoring only: $50-75/user/month
- Add-ons: vCIO +$500-2000/mo, Security/SOC +$25-75/user/mo, Backup +$10-25/user/mo

When users ask about their assessment:
- Reference their current form data and answers
- Suggest specific improvements or modifications
- Explain why certain questions matter
- Help them understand how their answers affect recommendations

Communication style:
- Conversational and approachable
- Clear and concise
- Use bullet points for clarity when listing options
- Provide specific, actionable advice
- Ask clarifying questions when needed

IMPORTANT: Keep responses focused and relatively brief (2-4 paragraphs max). Users are in a wizard flow, so respect their time.`;

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
    const { messages, formData, assessmentResult } = body;

    // Build context from current state
    let contextText = '';

    if (formData && Object.keys(formData).length > 0) {
      contextText += '\n\nCurrent user context:\n';
      contextText += `Assessment type: ${formData.assessment_type || 'Not selected yet'}\n`;
      contextText += `Form data: ${JSON.stringify(formData, null, 2)}\n`;
    }

    if (assessmentResult) {
      contextText += '\n\nUser has completed their assessment. Here are the results:\n';
      contextText += JSON.stringify(assessmentResult, null, 2);
    }

    // Add context to the first user message if available
    const userMessages = [...messages];
    if (contextText && userMessages.length > 0) {
      const firstUserMsgIndex = userMessages.findIndex((m: any) => m.role === 'user');
      if (firstUserMsgIndex !== -1) {
        userMessages[firstUserMsgIndex] = {
          ...userMessages[firstUserMsgIndex],
          content: userMessages[firstUserMsgIndex].content + contextText
        };
      }
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: CHAT_SYSTEM_PROMPT,
        messages: userMessages
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
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}

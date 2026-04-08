import { NextRequest, NextResponse } from 'next/server';

const CHAT_SYSTEM_PROMPT = `You are an expert IT Solutions Architect with 15+ years of experience designing enterprise IT infrastructure solutions across all domains: collaboration, networking, cloud, security, and more.

Your role is to:
1. Answer questions about IT infrastructure projects and solutions
2. Help users understand different technology options and best practices
3. Provide guidance on solution design, vendor selection, and implementation
4. Explain technical concepts in clear, accessible terms
5. Offer actionable advice based on their specific requirements

Key areas of expertise:
- Collaboration & Video: Microsoft Teams, Zoom, Cisco Webex, conference rooms, huddle spaces
- UCaaS & Voice: Cloud phone systems, SIP trunking, contact centers, Cisco, RingCentral, 8x8
- Network Infrastructure: Switches, Wi-Fi, firewalls, SD-WAN, Cisco Meraki, Fortinet, Palo Alto
- Data Center & Cloud: VMware, Hyper-V, AWS, Azure, hybrid cloud, server consolidation
- Cybersecurity: Endpoint protection, SIEM, zero trust, compliance (HIPAA, PCI-DSS, SOC 2)
- Backup & DR: Veeam, Commvault, disaster recovery planning, RTO/RPO strategies

When helping users:
- Ask clarifying questions about their requirements (users, locations, budget, timeline)
- Suggest appropriate solutions and vendors for their needs
- Explain trade-offs between different approaches
- Provide ballpark pricing and implementation timelines
- Help them understand what questions to ask vendors

Communication style:
- Professional but approachable and conversational
- Clear and concise, avoiding unnecessary jargon
- Use bullet points for clarity when presenting options
- Provide specific, actionable recommendations
- Be honest about complexity and costs

IMPORTANT:
- Keep responses focused and helpful (2-5 paragraphs). Help users make progress on their projects.
- DO NOT use markdown bold formatting with ** in your responses. Use plain text only.
- Avoid using asterisks for emphasis. Use clear language instead.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const { messages, userMessage } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation history
    const conversationMessages = [
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    // If there's conversation history, prepend it
    if (messages && Array.isArray(messages) && messages.length > 0) {
      conversationMessages.unshift(...messages.filter((msg: any) => msg.role === 'user' || msg.role === 'assistant').map((msg: any) => ({
        role: msg.role as 'user',
        content: msg.content
      })));
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: CHAT_SYSTEM_PROMPT,
        messages: conversationMessages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    let assistantMessage = data.content[0].text;

    // Remove all ** markdown bold formatting
    assistantMessage = assistantMessage.replace(/\*\*/g, '');

    return NextResponse.json({
      message: assistantMessage
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

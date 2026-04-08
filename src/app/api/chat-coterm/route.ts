import { NextRequest, NextResponse } from 'next/server';

const CHAT_SYSTEM_PROMPT = `You are an expert co-terming and licensing consultant helping users calculate and manage software license co-terming costs.

Your role is to:
1. Answer questions about co-terming, licensing calculations, and subscription management
2. Help users add, modify, or remove license line items
3. Explain co-terming concepts and calculations
4. Provide guidance on license optimization

IMPORTANT LOGIC FOR MATCHING LICENSES:
- When a user asks to add licenses, check if a similar license already exists in the current licenses list
- If a matching license exists (similar name/description), use "set_additional_licenses" instead of "add_license"
- Match licenses by looking for similar service names (e.g., "UCCX Standard License" matches "UCCX Standard Licenses")
- When adding co-term licenses to existing services, ALWAYS update the "additionalLicenses" field, NOT create a new line item

CRITICAL - Understanding "add" vs "set":
- "Add 2 more" means INCREMENT the current additionalLicenses by 2
- "Set to 2" or "I want 2 total" means SET additionalLicenses to exactly 2
- Look at the current "Additional Co-Term" value in the license info
- If user says "add X more" → calculate: current + X
- Always tell the user the NEW TOTAL after the change

Examples:
- Current: "UCCX Standard License" has Additional Co-Term: 1
  User says: "Add 2 more UCCX Standard Licenses"
  → Set additionalLicenses to 3 (1 + 2)
  Message: "I'll add 2 more UCCX Standard Licenses to your existing license line item. This will increase your additional co-term licenses from 1 to 3."

- Current: "UCCX Standard License" has Additional Co-Term: 0
  User says: "Add 2 UCCX Standard Licenses"
  → Set additionalLicenses to 2 (0 + 2)
  Message: "I'll add 2 UCCX Standard Licenses as additional co-term licenses to your existing line item."

- User says: "Add License 1 with $100 monthly cost" and no similar license exists
  → Use add_license
  Message: "I'll create a new license line item called License 1..."

Response format for calculator modifications:
{
  "message": "Your text response to the user",
  "actions": [
    {
      "type": "set_additional_licenses",
      "data": {
        "serviceDescription": "UCCX Standard License",
        "additionalLicenses": 3
      }
    }
  ]
}

Action types:
- "add_license": Add a BRAND NEW license line item (only when no matching license exists)
- "set_additional_licenses": SET the additionalLicenses field to an exact number (use this when updating existing licenses)
- "update_license": Update other fields of an existing license (requires "id" or "serviceDescription" to match)
- "remove_license": Remove a license (requires "id" or "serviceDescription" to match)
- "update_dates": Update agreement or co-term dates

Communication style:
- Conversational and helpful
- Clear and concise
- Confirm actions taken
- Explain calculations when relevant
- Always mention which existing license you're updating when adding co-term licenses

IMPORTANT: Always include both a friendly message AND the actions array in your response when modifying the calculator.`;

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
    const { messages, calculatorState } = body;

    // Build context from current calculator state
    let contextText = '';

    if (calculatorState) {
      contextText += '\n\nCurrent calculator state:\n';
      contextText += `Agreement Start Date: ${calculatorState.agreementStartDate}\n`;
      contextText += `Agreement Term: ${calculatorState.agreementTermMonths} months\n`;
      contextText += `Co-Term Start Date: ${calculatorState.coTermStartDate}\n`;
      contextText += `Billing Term: ${calculatorState.billingTerm}\n`;
      contextText += `Months Remaining: ${calculatorState.monthsRemaining}\n`;

      if (calculatorState.billingTerm === 'Annual' && calculatorState.currentYearMonths) {
        contextText += `Current Year Months Remaining: ${calculatorState.currentYearMonths}\n`;
      }

      contextText += `\nCurrent Licenses:\n`;

      if (calculatorState.licenses && calculatorState.licenses.length > 0) {
        calculatorState.licenses.forEach((license: any, index: number) => {
          const costLabel = calculatorState.billingTerm === 'Monthly' ? 'Monthly Cost' : 'Annual Cost';
          contextText += `${index + 1}. "${license.serviceDescription || 'Unnamed'}" (ID: ${license.id}) - Qty: ${license.quantity}, ${costLabel}: $${license.annualCost}, Additional Co-Term: ${license.additionalLicenses}\n`;
        });
      } else {
        contextText += 'No licenses added yet\n';
      }

      // Add calculated results
      if (calculatorState.results) {
        contextText += `\n**CALCULATED RESULTS (USE THESE EXACT VALUES IN YOUR RESPONSE):**\n`;

        if (calculatorState.billingTerm === 'Monthly') {
          contextText += `Current Monthly Cost: $${calculatorState.results.currentMonthlyCost.toFixed(2)}\n`;
          contextText += `Updated Monthly Cost: $${calculatorState.results.updatedMonthlyCost.toFixed(2)}\n`;
          contextText += `Monthly Cost Change: +$${calculatorState.results.monthlyCostChange.toFixed(2)}\n`;
        } else if (calculatorState.billingTerm === 'Annual') {
          contextText += `Current Annual Cost: $${calculatorState.results.currentAnnualCost.toFixed(2)}\n`;
          contextText += `Updated Annual Cost: $${calculatorState.results.updatedAnnualCost.toFixed(2)}\n`;
          contextText += `Annual Cost Change: +$${calculatorState.results.costChange.toFixed(2)}\n`;
          if (calculatorState.results.coTermCost !== null) {
            contextText += `Current Year Co-Term Cost: $${calculatorState.results.coTermCost.toFixed(2)} (for ${calculatorState.currentYearMonths} months until year end)\n`;
          }
        } else {
          contextText += `Current Annual Cost: $${calculatorState.results.currentAnnualCost.toFixed(2)}\n`;
          contextText += `Updated Annual Cost: $${calculatorState.results.updatedAnnualCost.toFixed(2)}\n`;
          contextText += `Cost Change: +$${calculatorState.results.costChange.toFixed(2)}\n`;
        }

        contextText += `Remaining Term Total: $${calculatorState.results.remainingTotal.toFixed(2)} (${calculatorState.monthsRemaining} months remaining)\n`;
        contextText += `Total Cost of Ownership (TCO): $${calculatorState.results.totalCostOfOwnership.toFixed(2)} (${calculatorState.agreementTermMonths} month contract)\n`;
        contextText += `\nIMPORTANT: Use these exact calculated values in your email. Do not recalculate them.\n`;
      }
    }

    // Add context to the first user message
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
        max_tokens: 2048,
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

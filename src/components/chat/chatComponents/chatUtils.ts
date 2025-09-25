export const simulateAIResponse = (userMessage: string): string => {
  const responses = [
    "I understand your question. Let me help you with that...",
    "That's a great question! From my analysis...",
    "I've processed your request and here's what I found...",
    "Thank you for your query. Based on my knowledge...",
    "I can help you with that. Let me analyze...",
  ];
  return (
    responses[Math.floor(Math.random() * responses.length)] +
    ` (Simulated response to: "${userMessage.substring(0, 50)}${
      userMessage.length > 50 ? "..." : ""
    }")`
  );
};

import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token,
});

interface OutputFormat {
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

export async function structured_output(
  system_prompt: string,
  user_prompt: string | string[],
  model: string = "gpt-4o"
): Promise<OutputFormat | OutputFormat[]> {
  const isListInput = Array.isArray(user_prompt);

  const tool_definition = {
    type: "function" as const,
    function: {
      name: "generate_mcq",
      description:
        "Generates a multiple-choice question with four options and the correct answer.",
      parameters: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                answer: { type: "string" },
                option1: { type: "string" },
                option2: { type: "string" },
                option3: { type: "string" },
                option4: { type: "string" },
              },
              required: [
                "question",
                "answer",
                "option1",
                "option2",
                "option3",
                "option4",
              ],
            },
          },
        },
        required: ["questions"],
      },
    },
  };

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: system_prompt,
      },
      {
        role: "user",
        content: isListInput ? user_prompt.join("\n") : user_prompt,
      },
    ],
    tools: [tool_definition],
    tool_choice: { type: "function", function: { name: "generate_mcq" } },
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  const rawJson = toolCall?.function?.arguments;

  if (!rawJson) return [];

  const parsed = JSON.parse(rawJson);

  return parsed.questions ?? [];
}

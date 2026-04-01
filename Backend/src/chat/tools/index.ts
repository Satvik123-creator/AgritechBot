import {
  FunctionCallingMode,
  FunctionDeclarationSchemaProperty,
  SchemaType,
  Tool,
} from '@google/generative-ai';
import { cropCalendarTool } from './cropCalendar.tool';
import { mandiPriceTool } from './mandiPrice.tool';
import { weatherTool, type ChatToolDefinition } from './weather.tool';
import { productRecommendationTool } from './productRecommendation.tool';

const toolRegistry = new Map<string, ChatToolDefinition>(
  [weatherTool, cropCalendarTool, mandiPriceTool, productRecommendationTool].map((tool) => [tool.name, tool])
);

export const TOOL_DEFINITIONS: Tool[] = [
  {
    functionDeclarations: [weatherTool, cropCalendarTool, mandiPriceTool, productRecommendationTool].map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: Object.fromEntries(
          Object.entries(tool.parameters.properties).map(([key, schema]) => [key, schema])
        ) as Record<string, FunctionDeclarationSchemaProperty>,
        required: tool.parameters.required,
      },
    })),
  },
];

export const TOOL_CONFIG = {
  functionCallingConfig: {
    mode: FunctionCallingMode.AUTO,
  },
};

export function getToolByName(name: string): ChatToolDefinition | undefined {
  return toolRegistry.get(name);
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const tool = getToolByName(name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return tool.execute(input);
}

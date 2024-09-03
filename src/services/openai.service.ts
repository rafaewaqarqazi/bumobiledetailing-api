import OpenAI from 'openai';
import { config } from '../config';
import { BadRequestError } from '../errors/badRequestError';
export class OpenAIService {
  private static getInstance() {
    return new OpenAI({
      apiKey: config.openAiKey,
    });
  }
  public static async *createStreamChatCompletion({
    messages,
  }: {
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  }) {
    try {
      const openai = this.getInstance();
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        stream: true,
      });
      // console.log({
      //   usage: stream.usage,
      // });
      // yield stream.choices[0]?.message?.content || '';
      for await (const chunk of stream) {
        yield chunk.choices[0]?.delta?.content || '';
      }
    } catch (e) {
      console.log({ e });
      yield `Something went wrong: ${e.message}`;
    }
  }

  public static async smsAgent({
    prompt,
    message,
    messages,
  }: {
    prompt: string;
    message?: string;
    messages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  }) {
    try {
      const openai = this.getInstance();
      const msgs = [...(messages || [])];
      if (!!message) {
        msgs.push({
          role: 'user',
          content: message,
        });
      }
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          ...(msgs || []),
        ],
      });
      return response.choices[0]?.message?.content || '';
    } catch (e) {
      throw new BadRequestError(e.message);
    }
  }
}

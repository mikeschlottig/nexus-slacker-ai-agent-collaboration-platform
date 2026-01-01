import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState, Message } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.0-flash'
  };
  async onStart(): Promise<void> {
    if (!this.env.CF_AI_API_KEY) {
      console.warn('[AGENT CONFIG ERROR] CF_AI_API_KEY is missing');
    }
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL || '',
      this.env.CF_AI_API_KEY || '',
      this.state.model
    );
  }
  async onRequest(request: Request): Promise<Response> {
    if (!this.env.CF_AI_API_KEY) {
      return Response.json({
        success: false,
        error: 'System Configuration Error: Missing AI API Key. Please contact administrator.'
      }, { status: 500 });
    }
    try {
      const url = new URL(request.url);
      const method = request.method;
      if (method === 'GET' && url.pathname === '/messages') {
        return this.handleGetMessages();
      }
      if (method === 'POST' && url.pathname === '/chat') {
        return this.handleChatMessage(await request.json());
      }
      if (method === 'DELETE' && url.pathname === '/clear') {
        return this.handleClearMessages();
      }
      if (method === 'POST' && url.pathname === '/model') {
        return this.handleModelUpdate(await request.json());
      }
      return Response.json({
        success: false,
        error: API_RESPONSES.NOT_FOUND
      }, { status: 404 });
    } catch (error) {
      console.error('Request handling error:', error);
      return Response.json({
        success: false,
        error: API_RESPONSES.INTERNAL_ERROR,
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  }
  private handleGetMessages(): Response {
    return Response.json({
      success: true,
      data: this.state
    });
  }
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean; threadId?: string }): Promise<Response> {
    const { message, model, stream, threadId } = body;
    if (!message?.trim()) {
      return Response.json({ success: false, error: API_RESPONSES.MISSING_MESSAGE }, { status: 400 });
    }
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMessage = createMessage('user', message.trim());
    if (threadId) userMessage.threadId = threadId;
    let updatedMessages = [...this.state.messages, userMessage];
    if (threadId) {
      updatedMessages = updatedMessages.map(msg => {
        if (msg.id === threadId) {
          return {
            ...msg,
            replyCount: (msg.replyCount || 0) + 1,
            lastReplyTimestamp: Date.now()
          };
        }
        return msg;
      });
    }
    this.setState({
      ...this.state,
      messages: updatedMessages,
      isProcessing: true
    });
    try {
      if (!this.chatHandler) throw new Error('Chat handler failed to initialize');
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = createEncoder();
        (async () => {
          try {
            this.setState({ ...this.state, streamingMessage: '' });
            const history = threadId 
              ? this.state.messages.filter(m => m.id === threadId || m.threadId === threadId)
              : this.state.messages.filter(m => !m.threadId);
            const response = await this.chatHandler!.processMessage(
              message,
              history,
              (chunk: string) => {
                this.setState({ 
                  ...this.state, 
                  streamingMessage: (this.state.streamingMessage || '') + chunk 
                });
                writer.write(encoder.encode(chunk)).catch(e => console.error('Writer failed:', e));
              }
            );
            const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
            if (threadId) assistantMessage.threadId = threadId;
            let finalMessages = [...this.state.messages, assistantMessage];
            if (threadId) {
              finalMessages = finalMessages.map(msg => {
                if (msg.id === threadId) {
                  return {
                    ...msg,
                    replyCount: (msg.replyCount || 0) + 1,
                    lastReplyTimestamp: Date.now()
                  };
                }
                return msg;
              });
            }
            this.setState({
              ...this.state,
              messages: finalMessages,
              isProcessing: false,
              streamingMessage: ''
            });
          } catch (error) {
            console.error('Streaming response failed:', error);
            const errorMsg = createMessage('assistant', 'Nexus encountered an error while processing your request.');
            if (threadId) errorMsg.threadId = threadId;
            this.setState({
              ...this.state,
              messages: [...this.state.messages, errorMsg],
              isProcessing: false,
              streamingMessage: ''
            });
          } finally {
            try { writer.close(); } catch { /* ignore */ }
          }
        })();
        return createStreamResponse(readable);
      }
      const history = threadId 
        ? this.state.messages.filter(m => m.id === threadId || m.threadId === threadId)
        : this.state.messages.filter(m => !m.threadId);
      const response = await this.chatHandler.processMessage(message, history);
      const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
      if (threadId) assistantMessage.threadId = threadId;
      let finalMessages = [...this.state.messages, assistantMessage];
      if (threadId) {
        finalMessages = finalMessages.map(msg => {
          if (msg.id === threadId) {
            return {
              ...msg,
              replyCount: (msg.replyCount || 0) + 1,
              lastReplyTimestamp: Date.now()
            };
          }
          return msg;
        });
      }
      this.setState({ ...this.state, messages: finalMessages, isProcessing: false });
      return Response.json({ success: true, data: this.state });
    } catch (error) {
      this.setState({ ...this.state, isProcessing: false });
      console.error('Chat error:', error);
      return Response.json({ 
        success: false, 
        error: error instanceof Error ? error.message : API_RESPONSES.PROCESSING_ERROR 
      }, { status: 500 });
    }
  }
  private handleClearMessages(): Response {
    this.setState({ ...this.state, messages: [] });
    return Response.json({ success: true, data: this.state });
  }
  private handleModelUpdate(body: { model: string }): Response {
    const { model } = body;
    this.setState({ ...this.state, model });
    this.chatHandler?.updateModel(model);
    return Response.json({ success: true, data: this.state });
  }
}
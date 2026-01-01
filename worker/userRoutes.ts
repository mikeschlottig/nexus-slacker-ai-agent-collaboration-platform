import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            console.error('Agent routing error:', error);
            return c.json({
                success: false,
                error: API_RESPONSES.AGENT_ROUTING_FAILED
            }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Workspace Routes
    app.get('/api/workspaces', async (c) => {
        const controller = getAppController(c.env);
        const workspaces = await controller.listWorkspaces();
        return c.json({ success: true, data: workspaces });
    });
    app.post('/api/workspaces', async (c) => {
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const workspace = {
            id: body.id || crypto.randomUUID(),
            name: body.name,
            initials: body.initials || body.name.substring(0, 1).toUpperCase(),
            color: body.color || 'bg-indigo-600',
            createdAt: Date.now()
        };
        await controller.addWorkspace(workspace);
        return c.json({ success: true, data: workspace });
    });
    // User Profile Routes
    app.get('/api/user/profile', async (c) => {
        const controller = getAppController(c.env);
        const profile = await controller.getUserProfile();
        return c.json({ success: true, data: profile });
    });
    app.put('/api/user/profile', async (c) => {
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const profile = await controller.updateUserProfile(body);
        return c.json({ success: true, data: profile });
    });
    // Existing Session Routes
    app.get('/api/sessions', async (c) => {
        try {
            const workspaceId = c.req.query('workspaceId');
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions(workspaceId);
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({ success: false, error: 'Failed to retrieve sessions' }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage, workspaceId } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    sessionTitle = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                } else {
                    sessionTitle = '#general';
                }
            }
            const controller = getAppController(c.env);
            await controller.addSession(sessionId, sessionTitle, workspaceId);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            return c.json({ success: true, data: { deleted } });
        } catch (error) {
            return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
        }
    });
}
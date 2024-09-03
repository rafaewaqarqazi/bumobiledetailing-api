import { jwtAuth } from '../policies/jwtAuth';
import AgentController from '../controllers/agent/agent.controller';
import { adminAuth } from '../policies/AdminAuth';

export default class AgentRouter {
  public static definingAgentRoutes(router: any) {
    router.post('/agent', jwtAuth, adminAuth, AgentController.createAgent);
    router.put('/agent', jwtAuth, adminAuth, AgentController.updateAgent);
    router.post(
      '/agent/duplicate/:id',
      jwtAuth,
      adminAuth,
      AgentController.duplicateAgent,
    );
    router.get('/agent/:type/:name', AgentController.getAgentByTypeAndName);
    router.get('/agents', jwtAuth, adminAuth, AgentController.getAll);
    router.delete(
      '/agent/:id',
      jwtAuth,
      adminAuth,
      AgentController.deleteAgent,
    );
  }
}

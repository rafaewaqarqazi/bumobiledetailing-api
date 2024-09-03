import { jwtAuth } from '../policies/jwtAuth';
import SMSConversationController from '../controllers/sms/sms.conversation.controller';
import { adminAuth } from '../policies/AdminAuth';
export default class SMSConversationRouter {
  public static definingSMSConversationRoutes(router: any) {
    router.get(
      '/conversation',
      jwtAuth,
      adminAuth,
      SMSConversationController.findConversation,
    );
    router.post('/sms', jwtAuth, adminAuth, SMSConversationController.sendSMS);

    router.get('/sms/callback', SMSConversationController.smsCallback);
    router.post(
      '/sms/generate',
      jwtAuth,
      adminAuth,
      SMSConversationController.generateSMS,
    );
    router.get(
      '/conversations',
      jwtAuth,
      adminAuth,
      SMSConversationController.listSMSConversation,
    );
    router.post(
      '/conversation',
      jwtAuth,
      adminAuth,
      SMSConversationController.createSMSConversation,
    );
    router.post(
      '/conversation/test',
      jwtAuth,
      adminAuth,
      SMSConversationController.createTestSMSConversation,
    );
    router.put(
      '/conversation',
      jwtAuth,
      adminAuth,
      SMSConversationController.updateSMSConversation,
    );
    router.put(
      '/conversation/agent/activation/:id',
      jwtAuth,
      adminAuth,
      SMSConversationController.updateAgentActivation,
    );
  }
}

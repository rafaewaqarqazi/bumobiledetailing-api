import { SmsMessageRepository } from '../repositories/sms.message.repository';

export const handleSocket = (socket) => {
  // socket.on('getNotifications', (callback) => {
  //   const notifyRepo = getManager().getRepository(Notifications);
  //   notifyRepo
  //     .find({ order: { createdAt: 'DESC' }, take: 30 })
  //     .then((notifications) => {
  //       const data = notifications?.map((item) => ({
  //         ...item,
  //         time: dayjs(item.createdAt).from(dayjs()),
  //       }));
  //       callback(data);
  //     })
  //     .catch(() => {
  //       callback([]);
  //     });
  // });
  socket.on('join-room', ({ roomId }, callback) => {
    socket.join(roomId);
    if (callback) {
      SmsMessageRepository.listByConversationId(roomId)
        .then((messages) => {
          callback(messages);
        })
        .catch(() => {
          callback([]);
        });
    }
  });
  socket.on('get-unseen-count', (callback) => {
    SmsMessageRepository.createQueryBuilder('smsMessages')
      .where('(smsMessages.seen = 0 OR smsMessages.seen is null)')
      .innerJoin(
        'smsMessages.smsConversation',
        'smsConversation',
        'smsConversation.test is null',
      )
      .getCount()
      .then((count) => {
        callback(count);
      })
      .catch(() => {
        callback(0);
      });
  });
  socket.on('seen', (data) => {
    if (!data) {
      return;
    }
    if (data?.all) {
      SmsMessageRepository.createQueryBuilder()
        .update()
        .set({ seen: true })
        .execute()
        .then(() => {
          SmsMessageRepository.createQueryBuilder('smsMessages')
            .where('(smsMessages.seen = 0 OR smsMessages.seen is null)')
            .getCount()
            .then((count) => {
              socket.emit('seen-updated', count);
            })
            .catch(() => {});
        })
        .catch(() => {});
    } else {
      SmsMessageRepository.createQueryBuilder()
        .update()
        .set({ seen: true })
        .where('smsConversation = :id', { id: data?.id })
        .execute()
        .then(() => {
          SmsMessageRepository.createQueryBuilder('smsMessages')
            .where('(smsMessages.seen = 0 OR smsMessages.seen is null)')
            .getCount()
            .then((count) => {
              socket.emit('seen-updated', count);
              socket.emit('seen-individual', data?.id);
            })
            .catch(() => {});
        })
        .catch(() => {});
    }
  });
};

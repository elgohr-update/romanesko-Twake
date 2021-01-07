import { logger } from "../../../../../../core/platform/framework";
import { NotificationPubsubHandler, NotificationServiceAPI } from "../../../../api";
import { ChannelUnreadMessage } from "../../../../types";

export class MarkChannelAsUnreadMessageProcessor
  implements NotificationPubsubHandler<ChannelUnreadMessage, void> {
  constructor(readonly service: NotificationServiceAPI) {}

  readonly topics = {
    in: "channel:unread",
  };

  readonly name = "MarkChannelAsUnreadMessageProcessor";

  validate(message: ChannelUnreadMessage): boolean {
    return !!(
      message &&
      message.channel &&
      message.channel.workspace_id &&
      message.channel.company_id &&
      message.channel.id &&
      message.member &&
      message.member.user_id
    );
  }

  async process(message: ChannelUnreadMessage): Promise<void> {
    logger.info(
      `${this.name} - Processing message for user ${message.member.user_id} in channel ${message.channel.id}`,
    );

    await this.addBadge(message);
  }

  async addBadge(message: ChannelUnreadMessage): Promise<void> {
    logger.info(
      `${this.name} - Creating a badge for user ${message.member.user_id} in channel ${message.channel.id}`,
    );

    try {
      this.service.badges.save({
        channel_id: message.channel.id,
        company_id: message.channel.company_id,
        user_id: message.member.user_id,
        workspace_id: message.channel.workspace_id,
        thread_id: null,
      });

      logger.info(
        `${this.name} - Created new badge for user ${message.member.user_id} in channel ${message.channel.id}`,
      );
    } catch (err) {
      logger.warn(
        { err },
        `${this.name} - Error while creating new badge for user ${message.member.user_id} in channel ${message.channel.id}`,
      );
    }
  }
}

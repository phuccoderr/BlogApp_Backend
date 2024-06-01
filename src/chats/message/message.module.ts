import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { ChatsModule } from '../chats.module';

@Module({
  imports: [forwardRef(() => ChatsModule)],
  providers: [MessageResolver, MessageService],
})
export class MessageModule {}

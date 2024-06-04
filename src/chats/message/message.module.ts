import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { ChatsModule } from '../chats.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => ChatsModule), UsersModule],
  providers: [MessageResolver, MessageService],
})
export class MessageModule {}

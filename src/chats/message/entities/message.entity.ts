import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { AbstractEntity } from 'src/common/database/abstract.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
@Schema()
export class Message extends AbstractEntity {
  @Field()
  // @Prop()
  content: string;

  @Field()
  // @Prop()
  createdAt: Date;

  // @Field()
  // @Prop()
  // userId: string;

  @Field(() => User)
  user: User;

  @Field()
  // @Prop()
  chatId: string;
}

import { ConfigService } from '@nestjs/config';
import { Connection, connect } from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (configService: ConfigService): Promise<Connection> => {
      const uri = configService.get<string>('MONGO_URI') || '';
      const mongooseInstance = await connect(uri, {
        // useNewUrlParser, useUnifiedTopology, etc. if you need them
      });
      return mongooseInstance.connection;
    },
    inject: [ConfigService],
  },
];

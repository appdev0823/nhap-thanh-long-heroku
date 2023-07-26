import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundExceptionFilter } from './filters';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { LoggerModule } from './logger/logger.module';
import { AuthMiddleware } from './middleware';
import { MiddlewareModule } from './middleware/middleware.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { RepositoryModule } from './repository/repository.module';
import { ProductModule } from './modules/product/product.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { InvoiceController } from './modules/invoice/invoice.controller';
import { ProductController } from './modules/product/product.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CONSTANTS } from './utils';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', CONSTANTS.FRONTEND_DIR),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MiddlewareModule,
        RepositoryModule,
        AuthModule,
        UserModule,
        ProductModule,
        InvoiceModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('MYSQL_HOST'),
                port: Number(configService.get('MYSQL_PORT')),
                username: configService.get('MYSQL_USERNAME'),
                password: configService.get('MYSQL_PASSWORD'),
                database: configService.get('MYSQL_DATABASE'),
                autoLoadEntities: true,
            }),
        }),
        LoggerModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: NotFoundExceptionFilter,
        },
        {
            provide: APP_FILTER,
            useClass: ValidationExceptionFilter,
        },
    ],
})
export class AppModule {
    /**
     * Configure middlewares
     */
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(UserController, ProductController, InvoiceController);
    }
}

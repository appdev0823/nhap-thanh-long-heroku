import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, ProductEntity, InvoiceEntity } from './index';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ProductEntity, InvoiceEntity])],
    exports: [TypeOrmModule],
})
export class EntityModule {}

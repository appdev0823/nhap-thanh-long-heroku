import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, ProductEntity, InvoiceEntity, InvoiceProductEntity } from './index';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ProductEntity, InvoiceEntity, InvoiceProductEntity])],
    exports: [TypeOrmModule],
})
export class EntityModule {}

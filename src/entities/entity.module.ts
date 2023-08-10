import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity, InvoiceProductEntity, ProductEntity, SettingEntity, UserEntity } from './index';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ProductEntity, InvoiceEntity, InvoiceProductEntity, SettingEntity])],
    exports: [TypeOrmModule],
})
export class EntityModule {}

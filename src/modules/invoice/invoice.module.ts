import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceProductRepository, InvoiceRepository, ProductRepository, UserRepository } from 'src/repository';

@Module({
    controllers: [InvoiceController],
    providers: [InvoiceService, InvoiceRepository, ProductRepository, InvoiceProductRepository, UserRepository],
})
export class InvoiceModule {}

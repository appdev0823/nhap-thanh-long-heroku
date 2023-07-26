import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository, ProductRepository } from 'src/repository';

@Module({
    controllers: [InvoiceController],
    providers: [InvoiceService, InvoiceRepository, ProductRepository],
})
export class InvoiceModule {}

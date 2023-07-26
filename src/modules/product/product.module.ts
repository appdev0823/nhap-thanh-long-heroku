import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from 'src/repository';

@Module({
    controllers: [ProductController],
    providers: [ProductService, ProductRepository],
})
export class ProductModule {}

import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { ProductRepository } from './product.repository';

@Module({
    providers: [UserRepository, ProductRepository],
    exports: [UserRepository, ProductRepository],
})
export class RepositoryModule {}

import { createMap } from '@automapper/core';

import { UserEntity, ProductEntity, InvoiceEntity, InvoiceProductEntity } from 'src/entities';
import { mapper } from 'src/utils/mapper';

import { UserDTO } from './user.dto';
import { ProductDTO } from './product.dto';
import { CustomerDTO, InvoiceDTO } from './invoice.dto';
import { InvoiceProductDTO } from './invoice-product.dto';

export * from './user.dto';
export * from './product.dto';
export * from './invoice.dto';
export * from './invoice-product.dto';

/**
 * Initialize mapper
 */
export const initMapper = () => {
    createMap(mapper, UserEntity, UserDTO);
    createMap(mapper, UserDTO, UserEntity);

    createMap(mapper, ProductEntity, ProductDTO);
    createMap(mapper, ProductDTO, ProductEntity);

    createMap(mapper, InvoiceEntity, InvoiceDTO);
    createMap(mapper, InvoiceDTO, InvoiceEntity);

    createMap(mapper, InvoiceProductEntity, InvoiceProductDTO);
    createMap(mapper, InvoiceProductDTO, InvoiceProductEntity);

    createMap(mapper, InvoiceEntity, CustomerDTO);
    createMap(mapper, CustomerDTO, InvoiceEntity);
};

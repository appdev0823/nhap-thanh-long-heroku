import { AutoMap } from '@automapper/classes';
import { ProductDTO } from './product.dto';

export class InvoiceSaveDTO {
    customer_id = '';
    customer_name = '';
    weight_grid: (number | null)[][] = [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
    ];
    product_list: (Pick<ProductDTO, 'id' | 'name' | 'price'> & { weight: 0 })[] = [];
    total_price = 0;
    total_weight = 0;
    created_by = '';
}

export class InvoiceDTO {
    @AutoMap() id: number;
    @AutoMap() customer_id: string;
    @AutoMap() customer_name: string;
    @AutoMap() weight_grid: string;
    @AutoMap() product_list: string;
    @AutoMap() total_weight: number;
    @AutoMap() total_price: number;
    @AutoMap() is_paid: 0 | 1;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_by: string;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}

export class InvoiceListItemDTO extends InvoiceDTO {
    user_name: string;
}

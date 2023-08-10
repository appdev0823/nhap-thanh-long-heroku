import { AutoMap } from '@automapper/classes';
import { InvoiceProductDTO } from './invoice-product.dto';

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
    product_list: InvoiceProductDTO[] = [];
    total_price = 0;
    total_weight = 0;
    depreciation_weight = 0;
    created_by = '';
}

export class InvoiceDTO {
    @AutoMap() id: number;
    @AutoMap() customer_id: string;
    @AutoMap() customer_name: string;
    @AutoMap() weight_grid: string;
    @AutoMap() total_weight: number;
    @AutoMap() depreciation_weight: number;
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

export class InvoiceDetailDTO {
    id = 0;
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
    product_list: InvoiceProductDTO[] = [];
    total_weight = 0;
    depreciation_weight = 0;
    total_price = 0;
    is_paid = 1;
    is_deleted = 0;
    created_by = '';
    user_name = '';
    created_date = '';
    updated_date = '';
}

export class InvoiceDateStatsDTO {
    date = '';
    total_weight = 0;
    depreciation_weight = 0;
    total_price = 0;
}

export class CustomerDTO {
    @AutoMap() customer_id: string;
    @AutoMap() customer_name: string;
}

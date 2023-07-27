import { Helpers } from 'src/utils';

const ROUTES = {
    AUTH: {
        MODULE: 'auth',
        LOGIN: 'login',
    },
    USER: {
        MODULE: 'user',
        PROFILE: 'profile',
    },
    PRODUCT: {
        MODULE: 'product',
        LIST: '',
        DETAIL: ':id',
        CREATE: '',
        UPDATE: ':id',
        DELETE: ':id',
        UPDATE_ORDER: 'update-order',
    },
    INVOICE: {
        MODULE: 'invoice',
        LIST: '',
        TOTAL_STATS: 'total-stats',
        DETAIL: ':id',
        CREATE: '',
        DELETE: ':id',
    },
} as const;
Helpers.deepFreeze(ROUTES);

export default ROUTES;

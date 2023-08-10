import { Helpers } from 'src/utils';

const ROUTES = {
    AUTH: {
        MODULE: 'auth',
        LOGIN: 'login',
        CHANGE_PASSWORD: 'change-password',
    },
    USER: {
        MODULE: 'user',
        PROFILE: 'profile',
        LIST: '',
        DETAIL: ':username',
        CREATE: '',
        UPDATE: ':username',
        TOGGLE: '/toggle/:username',
    },
    PRODUCT: {
        MODULE: 'product',
        LIST: '',
        STATS_LIST: 'stats-list',
        DETAIL: ':id',
        CREATE: '',
        UPDATE: ':id',
        DELETE: ':id',
        UPDATE_ORDER: 'update-order',
    },
    INVOICE: {
        MODULE: 'invoice',
        LIST: '',
        DATE_STATS_LIST: 'date-stats-list',
        MONTH_STATS_LIST: 'month-stats-list',
        CUSTOMER_LIST: 'customer-list',
        TOTAL_STATS: 'total-stats',
        DETAIL: ':id',
        CREATE: '',
        DELETE: ':id',
    },
    SETTING: {
        MODULE: 'setting',
        GET_LIST_BY_FIELD_NAME_LIST: 'list-by-field-name-list',
        UPDATE_MULTIPLE: 'update-multiple',
    },
} as const;
Helpers.deepFreeze(ROUTES);

export default ROUTES;

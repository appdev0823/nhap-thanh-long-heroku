import Helpers from './helpers';

/** Application constants */
const CONSTANTS = {
    APP_LOG_FOLDER_NAME: 'logs',
    ENVIRONMENTS: {
        DEV: 'DEV',
        STAG: 'STAG',
        PROD: 'PROD',
    },
    /** 7 days */
    ACCESS_TOKEN_EXPIRED_TIME: 604800,
    /** Total items per page  */
    ITEM_COUNT_PER_PAGE: 20,
    USER_ROLES: {
        REGULAR: 0,
        ADMIN: 1,
    },
    MYSQL_DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    FRONTEND_DIR: 'frontend'
} as const;
Helpers.deepFreeze(CONSTANTS);

export default CONSTANTS;

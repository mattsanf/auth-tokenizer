const RebillyAPI = require('rebilly-js-sdk').default;
const chalk = require('chalk');
const program = require('commander');
const permissions = require('./permissions');

program
    .option('-p, --permissions <permission_key>', 'which permissions to use')
    .option('-c, --customerId <id>', 'customer ID for which to create token')
    .option('-v, --verbose', 'verbose');

program.parse(process.argv);

const {API_URL = null, API_KEY = null, ORGANIZATION_ID = null, WEBSITE_ID = null} = process.env;
const log = console.log;

let permissionValues = null;
const permissionKey = program.permissions ?? 'admin';
if (permissions[permissionKey]) {
    permissionValues = permissions[permissionKey];
} else {
    return log(chalk.red(`"${program.permissions}" is not a supported permission`));
}

if (program.verbose) {
    console.log({
        API_URL,
        API_KEY,
        ORGANIZATION_ID,
        WEBSITE_ID,
        customerId: program.customerId,
        permissions: permissionValues
    });
}

const sandbox = API_KEY.includes('_sandbox');
const api = RebillyAPI({apiKey: API_KEY, sandbox});
const endpoint = API_URL ? API_URL : 'http://api-sandbox.dev-local.rebilly.com';
api.setEndpoints({[sandbox ? 'sandbox' : 'live']: endpoint});

const announce = (title) => {
    log(chalk.bold.cyan(title));
};

(async () => {
    try {
        announce('Creating login token...\n');
        const data = {
            mode: 'passwordless',
            customerId: program.customerId,
        };
        const {fields: {token}} = await api.customerAuthentication.login({data});
        log(chalk.yellow(token));
        announce('\n\nExchanging login for access token...\n');
        const {fields: {token: jwt}} = await api.customerAuthentication.exchangeToken({
            token,
            data: {
                invalidate: false,
                acl: [{
                    scope: {
                        organizationId: [ORGANIZATION_ID],
                    },
                    permissions: permissionValues,
                }],
                customClaims: {
                    websiteId: WEBSITE_ID
                }
            }
        });
        log(chalk.green(jwt));
    } catch (err) {
        return log(chalk.red(err));
    }
})();

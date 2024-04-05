const RebillyAPI = require('rebilly-js-sdk').default;
const chalk = require('chalk');
const program = require('commander');
const allPermissions = require('./permissions');

program
    .option('-p, --permission <permission_key>', 'which permission preset to use', 'admin')
    .option('-s, --permissions <permissions_array>', 'array of permission operation keys')
    .option('-c, --customerId <id>', 'customer ID for which to create token');

program.parse(process.argv);

const {API_URL = null, API_KEY = null, ORGANIZATION_ID = null, WEBSITE_ID = null} = process.env;

let permissions = null;
if (!program.permissions && allPermissions[program.permission]) {
    permissions = allPermissions[program.permission];
} else if (program.permissions) {
    console.log(program.permissions);
    permissions = program.permissions.split(',').map(v => v.trim());
} else {
    return console.log(chalk.red(`"${program.permissions}" is not a supported permission`));
}

const announce = (title) => {
    console.log(chalk.bold.cyan(`${title}\n`));
};

announce('Configuration');
console.log({
    API_URL,
    API_KEY,
    ORGANIZATION_ID,
    WEBSITE_ID,
    customerId: program.customerId,
    permissions,
}, '\n\n');

const sandbox = API_KEY.includes('_sandbox');
const api = RebillyAPI({apiKey: API_KEY, sandbox});
const endpoint = API_URL ? API_URL : 'http://api-sandbox.dev-local.rebilly.com';
api.setEndpoints({[sandbox ? 'sandbox' : 'live']: endpoint});

(async () => {
    try {
        announce('Creating login token...');
        const data = {
            mode: 'passwordless',
            customerId: program.customerId,
        };
        const {fields: {token}} = await api.customerAuthentication.login({data});
        console.log(chalk.yellow(token), '\n\n');

        announce('Exchanging login for access token...');
        const {fields: {token: jwt}} = await api.customerAuthentication.exchangeToken({
            token,
            data: {
                invalidate: false,
                acl: [{
                    scope: {
                        organizationId: [ORGANIZATION_ID],
                    },
                    permissions,
                }],
                customClaims: {
                    websiteId: WEBSITE_ID
                }
            }
        });
        console.log(chalk.green(jwt));
    } catch (err) {
        console.log(chalk.red(`${err}\n`));
        return console.log(err);
    }
})();

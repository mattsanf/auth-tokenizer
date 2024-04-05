const RebillyAPI = require('rebilly-js-sdk').default;
const chalk = require('chalk');
const open = require('open');
const config = require('dotenv').config();
const program = require('commander');
const permissions = require('./permissions/instruments');

const {parsed: {API_KEY = null, TARGET_URL = null, API_URL = null}} = config;
const log = console.log;

program
    .option('-o, --open', 'open page for pre-existing customer token')
    .option('-t, --target <url>', 'URL to target when opening in the browser')
    .option('-r, --redirect <url>', 'URL to redirect to at the end of the operation')
    .option('-c, --customerId <id>', 'customer ID for which to create token');

program.parse(process.argv);

// check API key
if (API_KEY === null) {
    return log(chalk.red('API Key not defined in .env file'));
}

const sandbox = API_KEY.includes('_sandbox');
const api = RebillyAPI({apiKey: API_KEY, sandbox});
const targetURL = program.target || TARGET_URL;
const endpoint = API_URL ? API_URL : 'http://api-sandbox.dev-local.rebilly.com';
api.setEndpoints({[sandbox ? 'sandbox' : 'live']: endpoint});

const announce = (title) => {
    log(chalk.bold.cyan(title));
};

// check URL
if (targetURL === null) {
    return log(chalk.red('Target URL not found'));
}

if (program.open) {
    announce('Open Pre-Existing');
    // TODO
} else {
    // if (!program.customerId) {
    //     return log(chalk.red('No customer ID provided'));
    // }
    (async () => {
        try {
            const data = {
                mode: 'passwordless',
                // customerId: program.customerId,
                customerId: 'cus_01H78BQQS5WH64DVNM67N479NM',
            };
            const {fields: {token}} = await api.customerAuthentication.login({data});
            announce('Creating Token...');
            log(chalk.yellow(token));
            const {fields: {token: jwt}} = await api.customerAuthentication.exchangeToken({
                token,
                data: {
                    invalidate: false,
                    acl: [{
                        scope: {
                            organizationId: [
                                '0a2540d2-2285-414d-a677-868bde7e442f'
                            ],
                        },
                        permissions: permissions
                    }],
                    customClaims: {
                        websiteId: 'pokemon.nintendo.com'
                    }
                }
            });
            log(chalk.green(jwt));
        } catch (err) {
            return log(err);
        }
    })();
}

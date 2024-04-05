# auth-tokenizer

Tokenize using the Rebilly API.

### Install

Clone the repo and run `yarn install`, then copy the `.env` file and define your API key and target URL.

### Environment Variables

```bash
API_URL=https://api-sandbox.rebilly.com
API_KEY=sk_sandbox_0000000000000000000000000000
ORGANIZATION_ID=org_0000000000000000000000000000
WEBSITE_ID=web_0000000000000000000000000000
```

### Usage

To trigger a token and open in the browser run

```bash
yarn go -c <customerId>
```

Change the permissions with `-p` flag. Available permissions are visible within `permissions.js`. Default permissions is `admin`

```bash
yarn go -c <customerId> -p <permission key>
``

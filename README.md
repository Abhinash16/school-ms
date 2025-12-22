Here’s a clean **README.md** draft for your project with the dev scripts included:

```markdown
# School SaaS Backend

This is the backend monorepo for the School SaaS platform.  
It is structured as a **monorepo** with separate apps for clients (schools/students) and platform (admin/CRM/accounts).

---

```markdown
## Folder Structure

school-saas/
├─ apps/
│  ├─ client/                     # School/tenant apps
│  │   ├─ school-api/             # Core school API: students, classes, fees, payments
│  │   ├─ accounts-api/           # Finance API for schools: invoices, payments, reports
│  │   └─ crm/                    # Optional school CRM
│  └─ platform/                   # SaaS platform apps
│      ├─ api/                    # Platform admin API
│      ├─ crm/                    # Platform CRM for leads & sales
│      └─ accounts/               # Platform finance (billing, subscription)
├─ packages/                      # Shared packages
│  ├─ auth/                       # JWT, password utils
│  ├─ db/                         # Sequelize models & database connection
│  ├─ rbac/                       # Role & permission helpers
│  └─ payments/                   # Payment gateway abstraction (Razorpay, Cashfree)
└─ package.json                    # Root package.json

---

## Environment Variables

Create a `.env` file in the root or each app with the following variables:

```

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=school_saas
DB_USER=root
DB_PASSWORD=yourpassword

RZP_KEY=your_razorpay_key
RZP_SECRET=your_razorpay_secret

````

---

## Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd school-saas
````

2. Install root dependencies:

```bash
npm install
```

3. Install app-specific dependencies:

```bash
cd apps/client/school-api && npm install
cd ../../accounts-api && npm install
cd ../../crm && npm install
cd ../../../platform/api && npm install
cd ../crm && npm install
cd ../accounts && npm install
```

---

## Running Development Servers

The following `npm` scripts are available in the root `package.json`:

```json
"scripts": {
  "dev:school-api": "cd apps/client/school-api && nodemon src/server.js",
  "dev:accounts-api": "cd apps/client/accounts-api && nodemon src/server.js",
  "dev:crm-client": "cd apps/client/crm && nodemon src/server.js",
  "dev:platform-api": "cd apps/platform/api && nodemon src/server.js",
  "dev:platform-crm": "cd apps/platform/crm && nodemon src/server.js",
  "dev:platform-accounts": "cd apps/platform/accounts && nodemon src/server.js"
}
```

Run any app using:

```bash
npm run dev:school-api
```

---

## APIs

* **School API** (`/apps/client/school-api`): students, classes, classrooms, fees, payments
* **Accounts API** (`/apps/client/accounts-api`): invoices, payments, reports
* **CRM** (`/apps/client/crm`): school CRM (optional)
* **Platform API** (`/apps/platform/api`): platform admin tasks
* **Platform Accounts** (`/apps/platform/accounts`): billing, subscription
* **Platform CRM** (`/apps/platform/crm`): leads & sales management

---

## Shared Packages

* **db**: Sequelize models & database connection
* **auth**: JWT and password utilities
* **rbac**: Role & permission helpers
* **payments**: Abstracted payment service for Razorpay, Cashfree

---

## Notes

* Sequelize `sync({ alter: true })` is used for development. For production, use migrations.
* JWT tokens include `school_id` and `role` for proper authorization.
* All APIs are structured with **separation of concerns**: client apps, platform apps, and shared packages.

---

## License

MIT

```

---

I can also create a **short version with quick-start cURL examples for each dev server** if you want to make onboarding faster.  

Do you want me to add that next?
```

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Environment variables

Copy `.env.example` to `.env` and fill it in. The values are in the team's shared env vars document.

| Variable | Required | What it is for |
| --- | --- | --- |
| `SEED_ADMIN_EMAIL` | No | Email of the user that `npm run db:seed` turns into `ADMIN`. The user must have signed in at least once. Local only: the seed deletes every match. |
| `KPI_API_KEY` | No | Key that `POST /kpis/snapshots` expects in the `X-Kpi-Key` header. Without it the API still boots and that endpoint answers 503. Use a different value in each environment. |
| `AZURE_STORAGE_CONNECTION_STRING` | Yes | Azure Blob Storage connection string for this environment. Backend only; never expose it through `NEXT_PUBLIC_` variables. |
| `AZURE_STORAGE_CONTAINER` | Yes | Image container name: `images`. |
| `SWAGGER_ENABLED` | No | `true` mounts the API docs at `/docs`. Leave it `false` or unset in production: then `/docs` answers 404. |

## Image storage (Azure Blob Storage)

Use a separate Storage Account for dev and prod, each with an `images` container.
The accounts may share a resource group. The backend uses `@azure/storage-blob`,
the official Azure SDK, to avoid implementing REST request signing manually
(QA-03).

### Azure setup

1. Create a Standard StorageV2 account in the backend's region, with LRS and the
   Hot access tier. Enable secure transfer (HTTPS), account key access and public
   network access for the public image URLs.
2. In the **Storage Account → Settings → Configuration**, set **Allow Blob
   anonymous access** to **Enabled** and save. This account-level setting is
   required even if the container is configured for public reads.
3. In **Data storage → Containers**, create `images`. Set its anonymous access
   level to **Blob (anonymous read access for blobs only)**, **not Container**.
   This allows reading a known image URL without exposing anonymous blob listing.
4. Upload a disposable image. Open its plain HTTPS URL in a private browser
   window, without signing in or adding a SAS query string. It must return the
   image. Also open
   `https://<account>.blob.core.windows.net/images?restype=container&comp=list`:
   anonymous listing must be denied (401/403/404), not return the image list. Confirm
   the saved settings in both the account and container if either check fails.
5. Copy the connection string from **Security + networking → Access keys**. In
   the backend App Service's **Environment variables → App settings**, configure
   `AZURE_STORAGE_CONNECTION_STRING` and `AZURE_STORAGE_CONTAINER=images`, then
   save/apply. Use each account's own connection string in its environment.
6. Repeat for prod with a different Storage Account. For local development, use
   the **dev** account's connection string in `back/.env`. Never commit actual
   keys or connection strings, or use prod credentials for local checks.

Public blobs are readable by anyone with their URL; upload and deletion require
the backend credentials. Enabling anonymous access at account level alone does
not make a private container public. See Microsoft's
[account and container access documentation](https://learn.microsoft.com/azure/storage/blobs/anonymous-read-access-configure).

### Service contract

`StorageModule` exports the global `StorageService`, following the existing
infrastructure-module pattern. It has no controller or repository. The users
resource exposes profile photo uploads; match photo uploads are a separate ticket.

```typescript
const url = await storage.upload(buffer, 'image/png', 'profiles');
await storage.remove(url);
```

- `upload(buffer, contentType, path)` accepts JPEG, PNG or WebP, verifies the MIME
  type and basic file signature, and accepts up to `5 * 1024 * 1024` bytes.
  Empty files, unsupported/mismatched types and invalid path prefixes throw
  `BadRequestException` (400). Signature checking is not a full image decoder.
- `path` is an internal prefix such as `profiles`, `matches` or `checks/spo-287`;
  use only letters, digits, `_`, `-` and `/` between nonempty segments. It is not
  an original filename. The service generates `<path>/<UUID>.<extension>`, sets
  the blob's `Content-Type` and returns only the public origin and path. Any SAS
  query string, URL credentials or fragment from the configured endpoint are
  excluded from the returned URL; the SDK client keeps its authorization.
- `remove(url)` accepts only canonical HTTPS URLs for the configured account
  and exact container, without credentials, query strings, fragments, encoded
  paths or dot segments. It operates on that container's client, never on a
  client created from user input. A missing blob is harmless (`deleteIfExists`).
  Consumer services are responsible for authenticating and authorizing deletion
  (including image ownership) before calling `remove`; validating the URL does
  not grant permission to delete the image.
- Azure operation failures return `ServiceUnavailableException` (503) with a
  generic message, without exposing credentials or SDK internals.
- The backend fails at startup if either required storage variable is missing;
  there is no test-mode bypass or fallback to another account. Constructing the
  client does not contact Azure or create containers at startup.

### Profile photo uploads

`POST /users/:id/photo` accepts a multipart file named `photo`, with Firebase
authentication and `OwnAccountGuard`. It returns `{ photoUrl }`. Missing files,
unsupported image content and files larger than 5 MB return 400 with
`La foto tiene que ser JPG, PNG o WebP de hasta 5 MB`, including multipart size
limit failures. Exactly 5 MB is accepted. Swagger documents the binary field.

Images are stored under `profiles/<userId>/`. Replacing a photo uses a conditional
database update: concurrent requests based on the same previous URL cannot both
replace it (409 for the losing request). Failed persistence triggers best-effort
cleanup of the new blob without masking the original error. After success, only
the previous image in this account, container and exact user's prefix is removed;
Google photos and other users' images are preserved. Cleanup failures are logged
without undoing a successful replacement. The ordinary profile PATCH does not
accept `photoUrl`; use the photo endpoint to change it.

### Manual verification

Use a temporary script calling the real service against the **dev** container:
upload one valid image, confirm an anonymous GET returns it with the correct
`Content-Type`, confirm anonymous listing is denied, call `remove(url)`, then
confirm that URL no longer returns the blob. Check the container's access policy
with the SDK's `getAccessPolicy()`: `blobPublicAccess` must be `blob`, never
`container`. Successful anonymous image access also confirms that account-level
anonymous access is enabled.

Before any network request, unsupported MIME types, text disguised as an image,
empty files and files over the limit must throw 400. Check `remove()` rejects
other accounts/containers, container-only URLs, HTTP, userinfo, SAS/query strings,
fragments, traversal, encoded separators and duplicate path separators. Start the
backend once with each required variable removed and check that its name appears
in the configuration error. Use a temporary `next/image` rendering check with the
returned URL, then remove any temporary routes and blobs. Run `npm run verify`
from the repository root; do not add `.spec.ts` files for this ticket.

### Security Agent compatibility

The shared Security Agent in `SportmatchOrg/agents-copilot` imports the real
`AppModule` and therefore also needs both storage variables. Its isolated runner
must set synthetic values **before** importing `AppModule`, like its existing
Firebase and VAPID setup. Do not supply dev/prod secrets or weaken `validateEnv`.

The minimal adjustment in that repository's
`.github/scripts/security-agent/boot-server.js` is:

```javascript
// Synthetic configuration: constructing the client does not contact Azure.
process.env.AZURE_STORAGE_CONNECTION_STRING ??=
  'DefaultEndpointsProtocol=https;AccountName=sportmatchsecurity;AccountKey=c3BvcnRtYXRjaC1zZWN1cml0eS10ZXN0LW9ubHk=;EndpointSuffix=core.windows.net';
process.env.AZURE_STORAGE_CONTAINER ??= 'images';
```

Without this runner configuration, the agent must fail with the names of the
missing variables. The current reusable workflow does not accept application
environment variables as inputs, so setting them in this repository's wrapper
alone will not configure the runner. Verify its disposable backend boots with
these values, anonymous requests remain 401 and authenticated requests work.
The runner does not need real storage access for this ticket's service-only API.

## API documentation

With `SWAGGER_ENABLED=true`, the interactive docs are at [http://localhost:3001/docs](http://localhost:3001/docs) and the OpenAPI JSON at [http://localhost:3001/docs-json](http://localhost:3001/docs-json).

They are generated from the code: the Swagger CLI plugin (`nest-cli.json`) reads the DTOs and their `class-validator` rules, so new endpoints and fields show up without extra decorators. Each controller only needs `@ApiTags` and, when it is protected, `@ApiBearerAuth`. For DTOs that extend another one, import `PartialType`, `OmitType` and `PickType` from `@nestjs/swagger`, not from `@nestjs/mapped-types`, or the inherited fields are missing from the docs.

To try a protected endpoint, click **Authorize** and paste a Firebase ID token in `bearer`. `POST /kpis/snapshots` uses the `kpi-key` scheme instead, with the value of `KPI_API_KEY`.

## Administrators

The `ADMIN` role cannot be granted through the API. To promote an existing user in any environment (including production) without running the seed:

```bash
$ npm run admin:promote -- <email>
```

It uses the `DATABASE_URL` of the environment and only updates that user's role. The user must have signed in at least once.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Cliente de Prisma

El cliente se genera en `src/generated/prisma/` (definido en el bloque `generator`
de `prisma/schema.prisma`). Esa carpeta está en el `.gitignore`: se regenera con
`npm run db:generate`.

Dos detalles de configuración a tener en cuenta:

- `output = "../src/generated/prisma"`: el cliente tiene que quedar dentro de
  `src/`. Si queda afuera, TypeScript sube la raíz de compilación y el build
  emite `dist/src/main.js` en lugar de `dist/main.js`, rompiendo `start:prod`.
- `moduleFormat = "cjs"`: el proyecto usa CommonJS. Sin esta opción el cliente
  se genera con `import.meta.url`, que solo existe en ES Modules, y la app
  falla al arrancar con `ReferenceError: exports is not defined`.

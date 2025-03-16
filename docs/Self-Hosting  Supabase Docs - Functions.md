![](https://supabase.com/docs/img/icons/menu/reference-analytics.svg)

## Self-Hosting Functions

A web server based on [Deno](https://deno.land/) runtime, capable of running JavaScript, TypeScript, and WASM services.

You can use it to:

-   Locally test and self-host Supabase's Edge Functions (or any Deno Edge Function)
-   As a programmable HTTP Proxy: You can intercept / route HTTP requests

##### Beta Version

Self hosted Edge functions are in beta. There will be breaking changes to APIs / Configuration Options.

`1`

`./run.sh start --main-service /path/to/supabase/functions -p 9000   `

using Docker:

`1`

`docker build -t edge-runtime .   `

`2`

`docker run -it --rm -p 9000:9000 -v /path/to/supabase/functions:/usr/services supabase/edge-runtime start --main-service /usr/services   `

-   Select the Deno version to upgrade and visit its tag on GitHub (eg: [https://github.com/denoland/deno/blob/v1.30.3/Cargo.toml](https://github.com/denoland/deno/blob/v1.30.3/Cargo.toml))
-   Open the `Cargo.toml` at the root of this repo and modify all `deno_*` modules to match to the selected tag of Deno.

We have put together a demo on how to self-host edge functions on [Fly.io](http://fly.io/) (you can also use other providers like Digital Ocean or AWS).

To try it yourself,

1.  Sign up for an [Fly.io](http://fly.io/) account and install [flyctl](https://fly.io/docs/hands-on/install-flyctl/)
2.  Clone the demo repository to your machine - [https://github.com/supabase/self-hosted-edge-functions-demo](https://github.com/supabase/self-hosted-edge-functions-demo)
3.  Copy your Edge Function into the `./functions` directory in the demo repo.
4.  Update the Dockerfile to pull the latest edge-runtime image (check [releases](https://github.com/supabase/edge-runtime/pkgs/container/edge-runtime))
5.  \[Optional\] Edit `./functions/main/index.ts`, adding any other request preprocessing logic (for example, you can enable JWT validation, handle CORS requests)
6.  Run `fly launch` to create a new app to serve your Edge Functions
7.  Access your Edge Function by visiting: `https://{your-app-name}.fly.dev/{your-function-name}`

You can view the logs for the Edge Runtime, by visiting Fly.io’s Dashboard > Your App > Metrics. Also, you can serve edge-runtime from multiple regions by running `fly regions add [REGION]`.
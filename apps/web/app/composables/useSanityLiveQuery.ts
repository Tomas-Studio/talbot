import type {
  ClientPerspective,
  ClientReturn,
  ContentSourceMap,
  QueryOptions,
  QueryParams,
  UnfilteredResponseQueryOptions,
} from '@sanity/client'
import {
  defineEncodeDataAttribute,
  type EncodeDataAttributeFunction,
} from '@sanity/core-loader/encode-data-attribute'
import type {AsyncDataOptions} from '#app'
import {tryOnScopeDispose} from '@vueuse/core'

type Noop = () => void

export interface UseSanityLiveQueryOptions<T> extends AsyncDataOptions<T> {
  /** Name of an additional client configured in `nuxt.config.ts`. */
  client?: string
  /** Override the auto-generated useAsyncData key. */
  key?: string
  /** Forwarded directly to `client.fetch()` — perspective, stega, useCdn, cacheMode, token, tag, … */
  queryOptions?: QueryOptions
  /** @deprecated Use `queryOptions.perspective` instead. */
  perspective?: ClientPerspective
  /** @deprecated Use `queryOptions.stega` instead. */
  stega?: boolean
}

/**
 * Drop-in replacement for `@nuxtjs/sanity`'s `useSanityQuery` that keeps
 * reactivity intact for live updates.
 *
 * **Why this exists.** The upstream composable creates a private `ref(null)`
 * inside the function, mutates it via `updateRefs()` from inside the
 * `useAsyncData` handler, then returns that ref via a Promise+object hybrid.
 * In Nuxt 4 + script-setup + `const { data } = await …` destructuring, the
 * dependency link from the template back to that local ref drops, so
 * mutations stop triggering re-renders — even when refetch fires correctly
 * and the network response carries fresh data.
 *
 * This implementation skips the bridge entirely: it exposes `useAsyncData`'s
 * own data ref (which Nuxt tracks reliably) and refetches on every live
 * event from Sanity's stream.
 *
 * **API parity with `useSanityQuery`:**
 *  - ✅ `client`, `key`, `queryOptions`, plus all `AsyncDataOptions`
 *  - ✅ Legacy top-level `perspective` and `stega` (deprecated, mirrors upstream)
 *  - ✅ Reactive `params` (changes auto-refetch via `watch`)
 *  - ✅ Reactive `perspective` (changes auto-refetch via `watch`)
 *  - ✅ Returns `{ data, sourceMap, encodeDataAttribute, refresh, execute, pending, error, status }`
 *  - ✅ Server-side token forwarding for draft perspectives (uses `liveContent.serverToken`)
 *  - ✅ Typed via TypeGen's `SanityQueries` augmentation
 *  - ✅ Source maps + `encodeDataAttribute` for Visual Editing overlays
 *  - ❌ Presentation Tool live-query loader (only used inside studio iframe;
 *       trivial to add — open an issue if you wire Visual Editing)
 *  - ❌ Tag-based surgical revalidation (we refetch on every event; fine for
 *       low write volume, easy to swap in if needed)
 *  - ❌ `createForwardingClient` / `queryEndpoint` proxy mode
 */
export async function useSanityLiveQuery<
  const Q extends string,
  T = ClientReturn<Q, unknown>,
>(
  query: Q,
  params?: QueryParams,
  options?: UseSanityLiveQueryOptions<{data: T; sourceMap?: ContentSourceMap}>,
) {
  const {
    client: clientName,
    key: keyOverride,
    queryOptions,
    perspective: legacyPerspective,
    stega: legacyStega,
    ...asyncDataOptions
  } = options ?? {}

  const sanity = useSanity(clientName)
  const sanityConfig = useSanityConfig()
  const clientConfig = sanity.client.config()

  // Reactive perspective. Re-fetches when perspective ref mutates.
  // Precedence: queryOptions.perspective > legacy > client default.
  const perspective = ref<ClientPerspective | undefined>(
    queryOptions?.perspective ?? legacyPerspective ?? clientConfig.perspective,
  )

  const stegaOption = queryOptions?.stega ?? legacyStega

  // Reactive params: clone into a reactive() so external mutations propagate
  // and `watch` triggers refetch. Matches upstream behaviour.
  const reactiveParams = params ? reactive({...params}) : undefined

  const key
    = keyOverride
      ?? `sanity-live:${query}:${reactiveParams ? JSON.stringify(reactiveParams) : ''}`

  // Wire reactive deps into useAsyncData's watch list so they auto-refetch.
  asyncDataOptions.watch = [
    ...(asyncDataOptions.watch ?? []),
    perspective,
    ...(reactiveParams ? [reactiveParams] : []),
  ]

  const result = await useAsyncData<{data: T; sourceMap?: ContentSourceMap}>(
    key,
    async () => {
      const needsDraftToken
        = perspective.value !== 'published' && perspective.value !== 'raw'

      // On SSR, when fetching drafts we forward the configured server token so
      // the request actually returns draft content. Client-side, the live
      // plugin's browserToken handles authentication for its own subscription;
      // explicit drafts fetched via `client.fetch` need the user to pass a
      // token through `queryOptions`.
      const serverToken
        = needsDraftToken && import.meta.server
          ? sanityConfig?.liveContent?.serverToken
          : undefined

      // Strip filterResponse from the user-supplied queryOptions so the
      // spread doesn't widen it to `boolean`. We then set it as a literal
      // `false`, which is what `UnfilteredResponseQueryOptions` requires
      // to pick the `client.fetch` overload that returns the wrapper
      // `{ result, resultSourceMap, … }` instead of the bare data.
      const {filterResponse: _ignored, ...passThroughQueryOptions}
        = queryOptions ?? {}

      const fetchOptions = {
        ...passThroughQueryOptions,
        filterResponse: false,
        perspective: perspective.value,
        // useCdn=false matters for live: the CDN can return referentially
        // identical responses inside its cache window, which makes Vue's ref
        // setter no-op on `oldVal === newVal`. Forcing the API endpoint
        // guarantees a fresh object each time so reactivity fires.
        useCdn: false,
        ...(serverToken ? {token: serverToken} : {}),
        ...(stegaOption !== undefined ? {stega: stegaOption} : {}),
      } as UnfilteredResponseQueryOptions

      const response = await sanity.client.fetch<T>(
        query,
        reactiveParams ?? {},
        fetchOptions,
      )

      return {data: response.result, sourceMap: response.resultSourceMap}
    },
    asyncDataOptions,
  )

  // Expose data / sourceMap / encodeDataAttribute as computed refs that read
  // from the asyncData ref. Computed reads register an explicit dep, so the
  // template tracks asyncData updates through these without any local-ref
  // bridge (which is exactly where the upstream module loses the link).
  const data = computed<T | null>(() => result.data.value?.data ?? null)
  const sourceMap = computed<ContentSourceMap | null>(
    () => result.data.value?.sourceMap ?? null,
  )
  const encodeDataAttribute = computed<EncodeDataAttributeFunction | Noop>(() =>
    defineEncodeDataAttribute(
      data.value,
      sourceMap.value ?? undefined,
      sanityConfig?.visualEditing?.studioUrl,
    ),
  )

  // Client-only: open Sanity's live event stream and refetch on every
  // message. `tryOnScopeDispose` handles the "no active effect scope" case
  // that happens when we're past the synchronous setup boundary after await,
  // so we don't get the Vue warning.
  if (import.meta.client) {
    const liveClient = sanity.client.withConfig({useCdn: false})
    const sub = liveClient.live.events().subscribe({
      next: (event) => {
        if (event.type === 'message') {
          result.refresh()
        }
      },
      error: err => console.error('[sanity-live]', err),
    })
    tryOnScopeDispose(() => sub.unsubscribe())
  }

  return {
    data,
    sourceMap,
    encodeDataAttribute,
    perspective,
    refresh: result.refresh,
    execute: result.execute,
    pending: result.pending,
    error: result.error,
    status: result.status,
  }
}

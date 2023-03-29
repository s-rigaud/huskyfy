# TODO

- [ ] 🚧 Fix other Github branch for reordering playlist
- [ ] 🚧 Back to last page when Spotify API token needs refresh
- [ ] ✨ Implement Spotify SDK to be able to listen to tracks (https://developer.spotify.com/documentation/web-playback-sdk/reference/)
- [ ] 🖼️ Skeleton loader for TrackItem and PlaylistCard
- [ ] 🖼️ Horizontal slider for TrackItem genre chips

## Feedbacks

## Vuetify 3.1

- [ ] 🎨 Add v-skeleton-loader for TrackItem
- [ ] 🎨 Add v-skeleton-loader for PlaylistCard
- [ ] 🎨 Add v-slide-group for "genre-chips"

## Advertisement plan.

1. [X] Add product to Product Hunt
2. [X] Find better catch phrases to use
3. [X] Improve page description (meta etc) for Google search bot
4. [X] Spread the word on LinkedIn
5. [ ] Wikipédia article
6. [X] Spread the word on Discord (NaN, Vuetify, Vue Land)
7. [ ] Ask Spotify to add the website link on their developer site
8. [ ] Youtube video
9. [ ] Tech and tips subreddit

## NPM package issues

* **axios 1.2.2** ==> A lot of TS definition moves, need to wait for a proper migration guide to update (introduces multiple changes and bug in the project)

* **@vueuse/core 9.9.0** ==> Change the way reactive works, can do not trigger update for reactive object using Pinia state

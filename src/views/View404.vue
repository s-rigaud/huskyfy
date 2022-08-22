<template>
    <section>
        <h1 class="rainbow-text" style="display:block">{{ $t('404.title.part1') }}</h1>
        <h1><span class="rainbow-text">{{ $t('404.title.part2') }}</span>😕</h1>
        <v-btn @click="backToPreviousPage" class="rainbow-v-btn" append-icon="mdi-map-search-outline">
            {{ $t('404.button') }}
        </v-btn>
    </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'View404',
    computed: {
    },
    methods: {
        backToPreviousPage() {
            this.$router.go(-1)
        }
    }
})
</script>
<style scoped>
section {
    height: 100%;
    width: 100%;
    display: flex;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    align-items: center;
    justify-content: center;
}

h1 {
    text-align: center;
}
</style>
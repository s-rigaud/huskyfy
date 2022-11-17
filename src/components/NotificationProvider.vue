<template>
    <v-snackbar v-for="notification of notificationsStore.notifications" :key="notification" v-model="snackbar"
        timeout="5000" :color="getColor(notification.type)" class="notification-snackbar">
        {{ notification.message }}
        <v-icon :icon="getIcon(notification.type)"></v-icon>
    </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Relevance } from '@/stores/notifications'
import { useNotificationsStore } from '@/stores/notifications'

export default defineComponent({
    name: 'NotificationProvider',
    setup() {
        const notificationsStore = useNotificationsStore()
        return { notificationsStore }
    },
    data() {
        return {
            snackbar: true
        }
    },
    methods: {
        getColor(type: Relevance): string {
            if (type === Relevance.success) return "green"
            if (type === Relevance.warning) return "#e1b12c"
            if (type === Relevance.error) return "#e84118"
            return "grey"
        },
        getIcon(type: Relevance): string {
            if (type === Relevance.success) return "mdi-checkbox-marked-circle"
            if (type === Relevance.warning) return "mdi-alert"
            if (type === Relevance.error) return "mdi-alert-octagon"
            return "mdi-menu"
        }
    },
    watch: {
        snackbar() {
            // When snackbar is closing
            this.notificationsStore.reset()
        }
    }
})
</script>
<style>
.notification-snackbar .v-snackbar__content {
    display: flex;
    flex-direction: row;
    align-items: center;

    text-align: center;
}
</style>

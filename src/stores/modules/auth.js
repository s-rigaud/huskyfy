import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => {
        return {
            temporaryToken: '',
            accessToken: 'BQD4mBcHVfd29-5b3udyxdQRpzO3JykryY82P_p32GdotBEIOBYMZftCAoVHuhmX5beaUXb9ZeuDvaH9-PWUmepyAWm8WLQbp6qWW7KGt8Q3t90h7nNRGFrTwsChjHJvxMVZDM5ucBJ-4xFJEFJ8jJp-B5FbA8AGQQ6USsGAX_Ob1hu6MqvEdvOMy_4Sjia93Gy2AOYGC57o4q71DzE',
            refreshToken: 'AQCDZXRUoDvQKLlEYho3fIHA2Lo1WjgsFsujNgLnjXuE_mLq1s4QmPzV7zN295yoQR_LyCPaCpAgpJzIu8UzSlNbQ2JpAyGLWI7tx2c9Z9cYk5ahNgdrFQ3clB9zFcWMrrw',
        }
    },
})
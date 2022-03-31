from pprint import pprint

import requests

encoded_credentials = "MGMyNmFiMzExZDc0NGY4ZmFhZTFmNWM4Y2NjNGFlMjE6MTQ0YzAwMmY5NDhhNDM4YTk1OGIyNTc4M2YyODM1ZmU="


# Request first access token
def requestFirstAccessToken():
    temp_token = "AQBFO4M2d2Xl9udU-aBGdJ2_MPbOFtD6c_t2IehG2jMQ9PtdOh_n46XTHorzqKCTaFDKtSPSv9BYhjMqL1vcA5SEepf_jTaKjcu6-kWwWiJ8sFW60-3zWkbZy0MW4CFMftgqH9rBKq8rX6QA6zYXAJh3Oioe8WneU_KzQP_aghIlRWvkuqkMuTpO7E-LOwguhaBeo0V8MwyCOZAX-xYjUFUeqmUnJT5iwoMZPjyAkX1syydyTv9g2_nuO5p7vtW7WOfNU2nUes5zGFtPPtlnVscVyXHhYhrD-mRzCH8jr5x5gMnovz_hAaVk0L0xm20EuCTcYRBG"

    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={
            "code": temp_token,
            "redirect_uri": "http://localhost:8080",
            "grant_type": "authorization_code",
        },
    )
    pprint(response.text)


# RefreshAccessToken
def requestAnotherToken():
    refresh_token = "AQA6t8I1MfXxyUeWt-48VdHKGme5atke6Bfn3pzA03E6DQnLoXga4A64sso3yHu_kX1La7JlL-C-Szq4sslyTjcpVI3Nwt3ikJJSek5cNNaKfwIj_uBL1JQ8i9kIXzfmfCE"

    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        },
    )
    pprint(response.text)


if __name__ == "__main__":
    import ipdb

    ipdb.set_trace()
    # requestFirstAccessToken()
    # requestAnotherToken()
    rep = requests.get("https://accounts.spotify.com/authorize?response_type=code&client_id=0c26ab311d744f8faae1f5c8ccc4ae21&scope=user-read-private%20user-read-email%20user-follow-read%20user-library-read%20playlist-read-collaborative%20playlist-read-private&redirect_uri=http://localhost:8080")
    pprint(rep.__dict__)

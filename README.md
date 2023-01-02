<p align="center">
    <a href="https://www.huskyfy.com" target="_blank" rel="noopener noreferrer">
        <img src="./src/assets/Huskyfy.png" alt="Huskyfy logo">
    </a>
</p>

# HUSKYFY - Interact with Spotify playlists smoothly

![Huskyfy Version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/s-rigaud/huskyfy/main/package.json&label=Huskyfy&query=$.version&color=red&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgEAYAAAAj6qa3AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAAAAAAAAPlDu38AAAAJcEhZcwAAAGAAAABgAPBrQs8AAAvDSURBVGjevZl7VFRXlsZ/t6p4CMUbAZGHIqFBUAwqHVskCj0jijjRBkknRnsggZB+OBBWdFg9BCLTiZORQYgdY1zQMx1bAWk0WAHSEWLSiK0uNYuJdlYSsQUMz6IooORVdeeP8nLTEEJpmHz/sLj3nH32/u4+3z5nl8Aco09THAeOjjYXyYD4ePRsgZgYsU1QQXg474hvwqJFNHIDnJ0nJ25gKeh07BQy4PZtwU7cCNevgxgKDQ0jAyPPgUbjXrM3GAYH58pf4bsa0P/7G6shKEjhbPoP2LtXvM0BePJJctkMdnZzxuwrvAcGg+DAn+HECdMfxMfhwAHHv+7RwOeff28EiGLhYzBv3tBKlTPs389/cRj27CECDahUcxbwbPiIL2B8XAjGD4qK7AMcXoTcXEH4ZwFGRuacAH3woXh45BFBI7wCf/wjHjRBWNj3FvBsgezDHS5eFHYYNbB9u/3jmcfhq69mm6eYbcDwfxbHwaOPCleFBGhqminw9vb+fgBRFMX/jwBNJrPd1tbe3m96L75GLzz2mOmGcj1cujT0ZdEZWL58VuJmejH5xaXAjYzB/PlTx+3bV1OjVkNFxdWrKhUsWODkBFBdnZqq04GHh4PDdwm8r294GGDLlrfecnKCzk69HuDpp3/4Q1GEgoJNm8xPpuAd5kF7u+Kcsh5Wr7Y/9fNT0Nk5ddi0DBDFMhFsbYXXhKVQWTlT4Fqt2bGqquvXVSrYvj0xMTkZbG3d3B55BLZtO3bMwQHGx43GhwncaDSZAJKSysqcncHa2tV1yRJISkpOfuopOHHi0iVBgP5+g+EbDezkHvj4mPyMuXD2rKRdsxIwtHJwExQUEIsvhIfP5OAHH9y8CeDo6OIyfz7k5+fn5+fDwYOFhYWFcO+eUunhAa+/fu6cjc2DE1BScv68tTXo9Wb6i4qKioqKIC8vLy8vD1xd3d29vOBPf7px41sN5fMhrFw57Kn6b9i3b+rrSdWWyhlRJrOqg+bb7H7wwZdfOjjAokWLFi1eDHZ2dnZ2dhAeHh4eHg5PPvnTnz71FBw5cvjwoUOweLGLy+goCPc3XVfX0JCVlZwhbm52duPjsGCBoyPAG298/LGtLaSmpqUlJcGKFStWrFghr+/n5+/v7w8ffXTnTnc37NixapVZhWbAdn4LWVnDvYcT4c03pS0xScBkHbewnLW03L2rVEJ09KZNgYHT34eFhYWFhcHgoMEwNgavvvrxx35+YGNjaztvHoyPj49PTIBKpVKpVGbxNJlgYmJsbHQUdLrBwa4uCA0NDQ0NnW5/2bJly5Ytg7q6qqpLl2bPKPF1loBazQLjDsjNBU7BCy+opJOb+OH9AwxstiRF29p6ekZGIDAwMPDrBHR0dHR0dEBNTU1NTQ2sWrVq1apVYG1tbW1tbYllM7y9fXz8/ECj0Wg0GoiIiIiIiICFCxcuXLhQXvfuXa12bMxyuzyPL+za1fvZgb/C3r0q6cgq5vI3S05uY2PmlDUazWXJ09PT09MTEhMTExMTwWAwGAwGOeCZAt+6devWrVtBqVQqlUqorq6urq6W30vzOjs7Ozs7ITU1NTU1VX6elpaWlpYGgqBQKJVgzjOws/t2msWXOQ329rb/aHcQNm9W5jy66Tjs2UMMlyEiYjYCOjp0OoCKipYWFxfQ6QYG9HpoaWlpaWkBDw8PDw8PebxCoVAoFLJ4rVu3bt26deDs7Ozs7Azu7u7u7u6wdu3atWvXQkJCQkJCAjQ0NDQ0NJi3hijKW+XOnTt37tyRienv12p7e2Hz5h/8YGgI3NzUaksSQXhX6ACtVjV5SUE8ZMnEu3fNBAwPGwwjI3D+/Pnz58/L4ichOzs7OztbFi+1Wq22zDUzysrKysrK4Nq1a9euXYOSkpKSkhLw9fX19fWFpqampqYmWTu6usyngaAgT0+LFlgiZsDy5QrhDI6weLGljnV3m29iAwN6/eAgBAQEBAQEyKksEREVFRUVFfXggUtwcnJycnKC9evXr1+/HiIjIyMjI+WMktbV6XS6gQHZL0sh5pIDAQEK8TjDYC49lhIgCODi4uLi4iKn/M6dO3fu3Ak5OTk5OTlQVVVVVVUlExITExMTEwO9vb2933SY7evr6+vrg7i4uLi4OFnlKysrKysrISsrKysrC1JSUlJSUuStI/nR3a3XCw9ytXuXbHBymvUuMBWffdbba2sLrq6urq6ukJGRkZGRIYugjY2NjY2N7HhdXV1dXR1s27Zt27Zt0Nzc3NzcLFeL9vb29vZ2uHDhwoULFyA2NjY2NhYaGxsbGxvh9OnTp0+fBisrKysrK1k8JRF0c3Nzc3OD9vahoYe5fAtDyhIn6OkRdeJ+cHefbUJq6smTLi5w8+bgoI8P1NbW1tbWgqOjo+PX88hkMplMJjllJTHLzMzMzMyE0tLS0tJSefzu3bt3794NxcXFxcXFIAiCIAjT7UgYGRkZGRmRCQsOdnLq6YHS0h07pp/4vwEGCqG7WyH+E3pobbWUsdBQb28Ao9FoNBpnTumpDksBBQUFBQUFTR8fEhISEhIij5vJjgS9Xq/X680HqvFxUKtVKsu7ACC8wm/g1i2F3HqyDI8/7u/f3w+jo6OjIyNy+bMU6enp6enpsGaNWdR+9KPVqyMj5ZS2FNJWkjJhy5bgYHN9shB/4TZ88olC6rlZOm/lSn9/AGtrc9+loqKioqJCTvGpSEpKSkpKgoiIpUtDQyEoyN9/0SJwd//889ZW8PAw/w0LW7IkMBCioiIiVq6UU3sqpHUkjTEaR0f1evjxj0NCHiB8xAZBDefOKQwJqr/B2bNCPk+A+YprCQoL4+M7O+HiRfOXqK+vr6+vnz6uoKCgoKAAhoYGBgYGIC/PysrZGfLyQkIiI+HXvw4OXr0aXnpJFOfNg87Orq6urukaIUESxytXrly5fBmOHElM7O8HhcKyGiDFea9W8RHU1k5OGnqlWA3HjomZ/AZSUy0l4uWX33/fzQ3q6m7d8vCAM2fOnHn3Xbk8Snu6vt5cDTIz09Offx7c3ZVKa2uQsubePZVKoYDCwmPHjh6F6Ojo6Oho+Yv39PT09PSYq8kTT0BsrJ/fV1/B/v0bN/b1Wf7lhQzeg7ffVr/zqzpIS5skYLIDdFBYAp9+SjSBYGU1ayrdT/yUlPJyV1fo7BSE4GA4cuStt44eBW9vb29v77+/9YkitLW1tbW1yXb8/Pz8/Pzk/ycmJiYmJuQj73PPPfvss8+Cj49S+cUX8PbbiYnd3WaCLYpcI2TB2JgxbsIOQkKcnTP1cOvWpL5K7WWpy2oxo/cdKC1NTtZqITzc3v7TTyE5OSnpJz+R63t/f39/f79cPaSApb/Sc51Op9Pp5HmSnTVr3Nxu3nyIwCU/DaIIhYVS4JPPp39Rc0ts+BeDJ6CxUWo2PshiAPX1N24olZCdffasqyvExm7cmJAAzzzzzDO7doGXl5eXl5c8XqvVarVaKC8vLy8vh7Nnq6tPnoTXXtu8ubcX4uKWLn2Y5pqQwavQ3Gz/P4TDhg2C4ld1MDo6IwEShhMPJ4KXl2m18TJcusQLvAi+vg/qwPCwebHf/e7KFUdH+P3vr151cAAbG3t7FxcQRXO/V6vt6+vqgp/9LDJydBTS09esGRwEBwdb2wcPG/iQVrh7V3l9ohkiI+3+LesidHRMI2g2O1J7WXxf0Q0ajdRsfCinvoaeHvPlReovLFz4tZ/Jvgt+y0FoaxPmC3+B+Hh1yi+9YOaTisX7aPBqcRzMny+sF8vg1CmxQ6iE6Og5cXoOIKW6MKJcC9u3z9QGf2gCJIim4jiwsRn24hDk5LCLefDii1Kn5XuL+L6qC7fxgIMH7V8Sl0N+/tQ9PucETIWkFWKdMRNyc6We21wTMnlQ+1/haTh+fOLkxCdw4MBUVX9gu3PloITu8sOJoFbbFZkuQ3w842I6bNjAPwinYMUK8V9ELSxeTKPQ/vc/j4s+oNMJRYIrtLZywnQUrl3DgBM0NhpKVP8K773nkfzzUzA0NFf+/h/zmjFvJZiiYwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMS0wMlQwOTo1ODowNiswMDowMONjve0AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDEtMDJUMDk6NTg6MDYrMDA6MDCSPgVRAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAxLTAyVDA5OjU4OjA2KzAwOjAwxSskjgAAAABJRU5ErkJggg==)
[![Front‑End_Checklist followed](https://img.shields.io/badge/Front‑End_Checklist-followed-brightgreen.svg)](https://github.com/thedaviddias/Front-End-Checklist/)
![Netlify Status](https://api.netlify.com/api/v1/badges/ca42d8a5-b247-4dd3-9840-65c5750da906/deploy-status)
![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=s-rigaud_huskyfy&metric=security_rating)
![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=s-rigaud_huskyfy&metric=vulnerabilities)
![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=s-rigaud_huskyfy&metric=code_smells)

<a href="https://www.producthunt.com/posts/huskyfy?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-huskyfy" target="_blank">
<img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=369274&theme=light" alt="Huskyfy - Best&#0032;tool&#0032;to&#0032;split&#0032;Spotify&#0032;playlists&#0032;by&#0032;genres&#0032;or&#0032;artists | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" />
</a>

## Stack

![Vue 3](https://img.shields.io/badge/Vue-3.2-brightgreen.svg)
![Vuetity 3](https://img.shields.io/badge/Vuetify-3-AEDDFF.svg)
![Pinia 2](https://img.shields.io/badge/Pinia-2.0-yellow.svg)
![Typescript](https://img.shields.io/badge/Typescript-4.9-blue.svg)
![Apexchart 3](https://img.shields.io/badge/Apexchart-3.36-red.svg)
![Axios 1](https://img.shields.io/badge/Axios-1.2-purple.svg)

## Functionalities ⚡

[Huskyfy website](https://www.huskyfy.com) offers different functionalities to tune and play with your Spotify playlists, you can :

* browse your playlists 🗃

* duplicate any playlist, once yours you can tweak them to make sure they absolutely fits you 📑

* filter tracks according to artist popularity, name or genres ✂️

* get some insights about which playlist contains the more indie artists 📊

* see which genres are more present in each playlist 📈

* sort playlist tracks according to most popular genres or artists in the playlist 📚

* save image recaps about all the informations of your playlists 🖼️

<p align="center">
    <img src="./src/assets/export-example.jpg" alt="Image example">
</p>

## Bugs 🐛

If you find any bug, do not hesitate to report it as a Github Issue or to send a mail at huskyfy.bugtracker@gmail.com 📧

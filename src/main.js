// Weather object
const WEATHER_DATA = {
    _server: "https://api.openweathermap.org/data",
    _version: "2.5",
    _current_weather: "weather?",
    _city: "",
    _location: "",
    _lang: "&lang=it",
    _units: "&units=metric",
    _icon: "http://openweathermap.org/img/wn/",
    _code: "&appid=" + process.env.API_CODE,
    set_city: function (name) {
        this._city = "q=" + name;
    },
    get_current_weather: function () {
        let city = this._city != "q=" ? this._city : this._location;
        let url = this._server + "/" + this._version + "/" + this._current_weather + city + this._lang + this._units + this._code;
        return url;
    },
    set_location: function (position) {
        this._location = "&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude;
        this.update();
    },
    /**
     * Update weather data and set in html page
     */
    update: function () {
        // First of all update city name
        WEATHER_DATA.set_city($("#cerca").val());

        // Get updated url for the request
        let url = WEATHER_DATA.get_current_weather();

        $.ajax({
            type: "post",
            url: url,
            dataType: "json",
            success: function (response) {
                // For success result we start the exit animation
                let t1 = animation(false);

                // On complete animation we update off screen all the weather data
                t1.eventCallback("onComplete", () => {
                    // Update weather data
                    $("#city_name").text(response.name);
                    $("#description").text(response.weather[0].description);

                    $("#temp").text(Number(response.main.temp).toFixed(0) + "°");
                    $("#temp_min").text(Number(response.main.temp_min).toFixed(0) + "°");
                    $("#temp_max").text(Number(response.main.temp_max).toFixed(0) + "°");

                    $("#wind").text(Number(response.wind.speed) + "km/h");
                    $("#humidity").text(Number(response.main.humidity) + "%");

                    let alba = new Date(response.sys.sunrise * 1000);
                    let tramonto = new Date(response.sys.sunset * 1000);

                    $("#alba").text(alba.getHours() + ":" + alba.getMinutes());
                    $("#tramonto").text(tramonto.getHours() + ":" + tramonto.getMinutes());

                    // Check to set day or night (we use icon data to get for day/night)
                    if (response.weather[0].icon.indexOf("d") > -1) {
                        set_day();
                    } else {
                        set_night();
                    }

                    // Start the enter animation
                    animation(true);
                });
            },
            error: function (response) {
                // If we get an error we show a modal
                Swal.fire("Errore!", "Non sono riuscito a trovare la città richiesta :(", "error");
            }
        });
    }
}

/**
 * Ask for browser geolocalization
 */
function enable_location() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((result) => {
            WEATHER_DATA.set_location(result);
        });
    }
}

/**
 * Animation for enter/exit of the main data container
 * @param {bool} enter Enter or exit animation
 */
function animation(enter) {
    // Animation
    const t1 = new TimelineMax();
    let container = document.querySelector(".container");
    let body = document.querySelector("body");

    t1.fromTo(container, .5, { x: enter ? "-100%" : "0%" }, { x: enter ? "0%" : "100%", ease: Power2.easeInOut })
        .to(container, .5, { opacity: enter ? 1 : 0, ease: Power2.easeInOut }, "-=.5");

    return t1;
}

/**
 * Animation to set day
 */
function set_day() {
    // day-night
    const day_animation = new TimelineMax();
    let day_night = document.querySelector(".mountains");
    let stars = document.querySelector(".stars");
    let day_night_text = document.querySelector(".primary-font");
    let cloud = document.querySelector(".clouds");
    let moon = document.querySelector(".moon");
    let sun = document.querySelector(".sun");

    day_animation
        .to(day_night, 5, { filter: "brightness(1)", ease: Power0.easeInOut })
        .to(day_night_text, 5, { color: "#000", ease: Power0.easeInOut }, "-=5")
        .to(cloud, 5, { opacity: "1", ease: Power0.easeInOut }, "-=5")
        .to(moon, 5, { left: "-20vw", ease: Power2.easeInOut }, "-=5")
        .to(moon, 5, { top: "120vh", ease: Power2.easeInOut }, "-=5")
        .to(sun, 5, { left: "60vw", ease: Power2.easeInOut }, "-=5")
        .to(sun, 5, { top: "15vh", ease: Power2.easeInOut }, "-=5")
        .to(stars, 5, { opacity: "0", ease: Power0.easeInOut }, "-=5");
}

/**
 * Animation to set night
 */
function set_night() {
    // day-night
    const day_animation = new TimelineMax();
    let day_night = document.querySelector(".mountains");
    let day_night_text = document.querySelector(".primary-font");
    let cloud = document.querySelector(".clouds");
    let moon = document.querySelector(".moon");
    let sun = document.querySelector(".sun");

    let stars = document.querySelector(".stars");
    day_animation
        .to(day_night, 5, { filter: "brightness(0.2)", ease: Power0.easeInOut })
        .to(day_night_text, 5, { color: "#FFF", ease: Power0.easeInOut }, "-=5")
        .to(moon, 5, { left: "60vw", ease: Power2.easeInOut }, "-=5")
        .to(moon, 5, { top: "15vh", ease: Power2.easeInOut }, "-=5")
        .to(sun, 5, { left: "-20vw", ease: Power2.easeInOut }, "-=5")
        .to(sun, 5, { top: "120vh", ease: Power2.easeInOut }, "-=5")
        .to(cloud, 5, { opacity: ".25", ease: Power0.easeInOut }, "-=5")
        .to(stars, 5, { opacity: "1", ease: Power0.easeInOut }, "-=5");
}

/**
 * Initial function when document is ready
 */
$(document).ready(function () {
    // Ask to use location from browser
    enable_location();

    // Clouds animation (loop animation)
    const cloud_animation = new TimelineMax({ repeat: -1 });
    let cloud = document.querySelector(".clouds");
    cloud_animation.fromTo(cloud, 30, { "background-position-x": "1000px" }, { "background-position-x": "0px", ease: Power0.easeInOut });

    // Update weather with update button
    $("#update").click(function (e) {
        // Stop default form action
        e.preventDefault();

        // Close navbar for mobile device for better experience
        $(".navbar-collapse").collapse('hide');

        // Update weather
        WEATHER_DATA.update();
    });
});

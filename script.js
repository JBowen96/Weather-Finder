$(document).ready(function () {
    //search button and input field clearing
    $("#search-btn").on("click", function () {
        var searchVal = $("#search-input").val();
        $("#search-input").val("");
        weatherFunction(searchVal);
        weatherForecast(searchVal);
    });

    //search btn entry
    $("search-btn").keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode === 13) {
            weatherFunction(searchVal);
            weatherForecast(searchVal);
        }
    });

    //local storage history pull
    var history = JSON.parse(localStorage.getItem("history")) || [];

    //history array for length correction
    if (history.length > 0) {
        weatherFunction(history[history.length - 1]);
    }
    //create a new row for each element
    for (var i = 0; i < history.length; i++) {
        createRow(history[i]);
    }

    //places history in a column 
    function createRow(text) {
        var listItem = $("<li>").addClass("list-group-item").text(text);
        $(".history").append(listItem);
    }

    //listens for click on history
    $(".history").on("click", "li", function () {
        weatherFunction($(this).text());
        weatherForecast($(this).text());
    });

    //main function for pulling weather by city name
    function weatherFunction(searchVal) {

        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchVal + "&appid=74391264810338477c159e48dda1725b",


        }).then(function (data) {
            //search = no val
            if (history.indexOf(searchVal) === -1) {
                
                history.push(searchVal);
                //push to local storage
                localStorage.setItem("history", JSON.stringify(history));
                createRow(searchVal);
            }
            // removes old content
            $("#today").empty();

            var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");


            var card = $("<div>").addClass("card");
            var cardBody = $("<div>").addClass("card-body");
            var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
            var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + " %");
            var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " K");
            console.log(data)
            var lon = data.coord.lon;
            var lat = data.coord.lat;

            $.ajax({
                type: "GET",
                url: "https://api.openweathermap.org/data/2.5/uvi?appid=74391264810338477c159e48dda1725b&lat=" + lat + "&lon=" + lon,


            }).then(function (response) {
                console.log(response);

                var uvColor;
                var uvResponse = response.value;
                var uvIndex = $("<p>").addClass("card-text").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(uvResponse);


                if (uvResponse < 3) {
                    btn.addClass("btn-success");
                } else if (uvResponse < 7) {
                    btn.addClass("btn-warning");
                } else {
                    btn.addClass("btn-danger");
                }

                cardBody.append(uvIndex);
                $("#today .card-body").append(uvIndex.append(btn));

            });

            // append to page
            title.append(img);
            cardBody.append(title, temp, humid, wind);
            card.append(cardBody);
            $("#today").append(card);
            console.log(data);
        });
    }
    // function for searching 
    function weatherForecast(searchVal) {
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchVal + "&appid=74391264810338477c159e48dda1725b&units=imperial",

        }).then(function (data) {
            console.log(data);
            $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

            //loop for 5 days worth of info
            for (var i = 0; i < data.list.length; i++) {

                if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

                    var titleDays = $("<h3>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
                    var imgDays = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
                    var colDays = $("<div>").addClass("col-md-2.5");
                    var cardDays = $("<div>").addClass("card bg-primary text-white");
                    var cardBodyDays = $("<div>").addClass("card-body p-2");
                    var humidDays = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
                    var tempDays = $("<p>").addClass("card-text").text("Temperature: " + data.list[i].main.temp + " °F");

                    //merge together and put on page
                    colDays.append(cardDays.append(cardBodyDays.append(titleDays, imgDays, tempDays, humidDays)));
                    //append card to column, body to card, and other elements to body
                    $("#forecast .row").append(colDays);
                }
            }
        });
    }

});
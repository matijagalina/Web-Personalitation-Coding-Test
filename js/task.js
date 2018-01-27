function initialize() {
    // --------------------------- BUILDING THE DOM STRUCTURE WITH jQUERY -----------------------------------

    const body = $("#top");

    /* Create modal button rather than automatic popup because it's less intrusive for the user
    and it gives user a better control over it's behavior */
    let buildButton = $('<button id="modalBtn">Open Github users</button>').appendTo(body);
    const button = $('#modalBtn');

    button.delay(1000).fadeIn(500);

    // ------- Create user list view elements ------
    let buildListView = $('<div id="listView" class="viewStyle"></div>').appendTo(body);
    const listView = $('#listView');
    let buildListContainer = $('<div id="listContainer" class="container"></div>').appendTo(listView);
    const listContainer = $('#listContainer');
    let buildHeaderList = $('<header id="headList">Github users</header>').appendTo(listContainer);
    const listHeader = $('#headList');
    let buildCloseList = $('<span id="listClose" class="dismissButton">&times;</span>').appendTo(listHeader);
    let buildList = $('<ul id="list"></ul>').appendTo(listContainer);
    let buildLoadingList = $('<div class="loader">Loading ... </div>').appendTo(listContainer);

    // -------- Create details view elements -------
    let buildDetails = $('<div id="detailsView" class="viewStyle"></div>').appendTo(body);
    const details = $('#detailsView');
    let buildDetailsContainer = $('<div id="detailsContainer" class="container"></div>').appendTo(details);
    const detailsContainer = $('#detailsContainer');
    let buildHeaderDetails = $('<header id="detailsHeader"></header>').appendTo(detailsContainer);
    let buildCloseDetails = $('<span id="detailsClose" class="dismissButton">&times;</span>').appendTo(detailsContainer);
    let buildDetailsImg = $('<img id="detailsImg">').appendTo(detailsContainer);
    let buildCompany = $('<p id="company"></p>').appendTo(detailsContainer);
    let buildStats = $('<p id="stats"></p>').appendTo(detailsContainer);
    let buildPreLoadingDetails = $('<div id="preDetailsLoad"></div>').appendTo(detailsContainer);
    const preloaderDetails = $('#preDetailsLoad');
    let buildLoadingDetails = $('<div class="loader">Loading ... </div>').appendTo(preloaderDetails);

    // Added const variables for created elements to be used in code
    const closeList = $('#listClose');
    const closeDetails = $('#detailsClose');
    const userList = $('#list');
    const detailsHeader = $('#detailsHeader');
    const detailsImg = $('#detailsImg');
    const company = $('#company');
    const stats = $('#stats');
    // URL of the Github API for fetching all users
    const urlGithub = "https://api.github.com/users?since=135";

    // Array which receives every clicked user login name
    let clicked = [];

    // -------------------------DEFINING DATA FETCH FUNCTION---------------------------------------------------

    // Adding loading animation while waiting for ajax to fetch the data
    $(document).ajaxStart(function () {
        $('#preDetailsLoad').show();
        $(".loader").show();
    });

    $(document).ajaxStop(function () {
        $(".loader").hide();
        $('#preDetailsLoad').hide();
    });

    // Fetch the list of users and create list items for every user
    function fetchAllUsers() {
        $.ajax({
            type: "GET",
            url: urlGithub,
            success: function (data) {
                /* ---- Filter the already seen users from the fetched data -----

                 I have used sessionStorage - for more permanent solution 
                 replace sessionStorage with localStorage */
                if (sessionStorage.length === 0) {
                    sessionStorage.setItem("clickedUser", JSON.stringify(clicked));
                    let storedLogins = sessionStorage.getItem("clickedUser");
                    clicked = JSON.parse(storedLogins);

                    let filteredList = $.grep(data, function (i) {
                        return clicked.indexOf(i.login) < 0;
                    });

                    $.each(filteredList, function (i, user) {
                        let item = $('<li></li>').appendTo(userList);
                        item.text(user.id + " - " + user.login);
                    });
                } else if (sessionStorage.length !== 0) {
                    let storedLogins = sessionStorage.getItem("clickedUser");
                    clicked = JSON.parse(storedLogins);

                    let filteredList = $.grep(data, function (i) {
                        return clicked.indexOf(i.login) < 0;
                    });

                    $.each(filteredList, function (i, user) {
                        let item = $('<li></li>').appendTo(userList);
                        item.text(user.id + " - " + user.login);
                    });
                }
            },
            error: function (request, status, error) {
                alert("Error requesting Github API: " + request.responseText);
            }
        });
    }

    // ------------------------------- DEFINING THE VIEWS BEHAVIOUR --------------------------------------

    // Button onclick behaviour
    button.click(function () {
        button.hide();
        listView.show();
        listHeader.show();

        userList.empty();
        fetchAllUsers();
    });

    // List dismiss button behaviour
    closeList.click(function () {
        listView.hide();
        button.show();
    });

    // Event delegation listening to list items
    userList.on("click", "li", function (e) {
        let clickedRow = $(e.target);
        let clickedRowContent = clickedRow.text();
        // Extracts and saves the user login name from the content of the clicked list item
        let clickedUserLogin = clickedRowContent.split(" ")[2];

        // Push the clicked user login name to an array and set it to web storage
        clicked.push(clickedUserLogin);
        sessionStorage.setItem("clickedUser", JSON.stringify(clicked));

        // Forms the URL of the clicked user
        let userURL = "https://api.github.com/users/" + clickedUserLogin;

        // Cleares the user list - without it it would only add the same users list after the last
        userList.empty();

        listView.hide();
        details.show();

        // Fetch the clicked user data
        $.ajax({
            type: "GET",
            url: userURL,
            success: function (data) {
                /* Change company name to "None" if the data.company is listed as null
                It looks better for the end user */
                if (data.company === null) {
                    data.company = "None";
                }

                detailsHeader.text(data.login);
                detailsImg.attr("src", data.avatar_url);
                company.text("Company: " + data.company);
                stats.html("Public repos: " + data.public_repos + "<br/>" +
                    "Public gists: " + data.public_gists);
            },
            error: function (request, status, error) {
                alert("Error requesting Github API: " + request.responseText);
            }
        });
    });

    // Details dismiss button behaviour
    closeDetails.click(function () {
        detailsHeader.text("");
        detailsImg.attr("src", "");
        company.text("");
        stats.html("");

        details.hide();
        button.show();
    });
}

$(document).ready(initialize);

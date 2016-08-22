/*///////////////////////////////////////
///        Listify for Spotify        ///
///       by Fuzzy - thefuzz.xyz      ///
///  github.com/fuzzymannerz/listify  ///
*////////////////////////////////////////


// Hold global var information
selectedlist = [];
plistarray = [];
playlistid = [];
globaltoken = [];
globaluser = [];
globaluserurl = [];
trackarray = [];
globaltracklist = [];

// Animate the list depending on amount of tracks
function autoexpander(){
var $selector = $('#textlist');
$selector.data('oHeight',$selector.outerHeight()).css('height','auto').data('nHeight',$selector.outerHeight()).height($selector.data('oHeight')).animate({height: $selector.data('nHeight')},400);
}

// Run on dropdown list select
function dropdownselect() {
    var l = document.getElementById("playlistchooser");
    var s = l.options[l.selectedIndex].value;
    selectedlist = s;
    if (selectedlist === '...'){
    $("#playlistname").html('<span id="noplaylist">No selection</span>');
    $("#printdisabled").show();
    $("#copydisabled").show();
    $("#trackcount").hide();
    $("#printout").hide();
    noselection();
    }
    else{
    $("#trackcount").show();
    $("#printout").show();
    $("#printdisabled").hide();
    $("#copydisabled").hide();
    chosenlookup();
    }
}

            // Set the clipboard JS to the textbox and add a print link -- early to avoid rendering issues
            var clipboard = new Clipboard('#selectbutton');
            $("#trackcount").html('<span id="selectbutton" data-clipboard-target="#textlist" alt="Copy tracklist to the clipboard"><i class="fa fa-clipboard" aria-hidden="true"></i> Copy track list</span><span id="copied"><i class="fa fa-check" aria-hidden="true"></i> Copied to clipboard!</span>');
            $("#printout").html('<span id="printbutton" onClick="printout();"><i class="fa fa-print" aria-hidden="true"></i> Print track list</span>');
            $("#trackcount").hide();
            $("#printout").hide();

            // Deal with the clipboard selection
            clipboard.on('success', function(e) {
            $("#printout").hide();
            e.clearSelection();
            $("#copied").fadeIn(500);
            $("#copied").delay(1000).fadeOut(500);
            $("#printout").delay(2000).fadeIn();
            });

// Do the login and the rest of it...
(function () {

    function login(callback) {
        var CLIENT_ID = 'YOUR_SPOTIFY_APP_CLIENT_KEY';
        var REDIRECT_URI = 'THE_LOCATION_OF_AUTH.HTML';

        function getLoginURL(scopes) {
            return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
                '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
                '&scope=' + encodeURIComponent(scopes.join(' ')) +
                '&response_type=token';
        }

        var url = getLoginURL([
            'user-read-email', 'playlist-read-private', 'playlist-read-collaborative'
        ]);

        var width = 450,
            height = 730,
            left = (screen.width / 2) - (width / 2),
            top = (screen.height / 2) - (height / 2);

        window.addEventListener("message", function (event) {
            var hash = JSON.parse(event.data);
            if (hash.type == 'access_token') {
                callback(hash.access_token);
            }
        }, false);

        var w = window.open(url,
            'Spotify',
            'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
        );

    }

    function getUserData(accessToken) {
        return $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }

    var loginButton = document.getElementById('btn-login');

    // Hide all info DIVs until logged in
    $("#right")
        .hide();

    loginButton.addEventListener('click', function () {
        login(function (accessToken) {
            getUserData(accessToken)
                .then(function (response) {

                    // Return display name
                    var username = response.id;
                    var userurl = response.external_urls.spotify;
                    // Set the global user URL
                    globaluserurl.push(userurl);
                    var userimage = response.images[0].url;

                    // Set access token and username vars for use outside of this
                    globaltoken = accessToken;
                    globaluser = username;

                    // Get user playlist info
                    $.ajax({
                        url: 'https://api.spotify.com/v1/users/' + username + '/playlists?limit=50',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken
                        },
                        success: function (data) {

                            // Create new global var array and set playlist vars from data
                            var plist = [];
                            for (var index in data.items) {
                                // Only show playlists owned by logged in user and have tracks in them
                                if(data.items[index].owner.id === username && data.items[index].tracks.total > 0){
                                var listreturn = data.items[index].name;
                                var listreturnid = data.items[index].id;
                                var arrayreturn = {
                                    name: listreturn,
                                    id: listreturnid
                                };
                                plistarray.push(arrayreturn);
                                plist.push(listreturn);
                                }//IF
                            }

                            // Set the DIV contents
                            $("#prelogin, footer, header, splogo")
                                .fadeOut('slow', function () {
                                    $('#left')
                                        .css({
                                            'width': '50%',
                                            'float': 'left',
                                        });
                                    $("#splogo").hide();
                                    $('#container')
                                        .css({
                                            'width': '100%',
                                            'flex': '',
                                        });
                                    $('#wrapper')
                                        .css({
                                            'display': '',
                                            'align-items': '',
                                            'min-height': '',
                                            'justify-content': '',                                                                                       
                                        });
                                    $("#right")
                                        .fadeIn('slow');
                                    $("#usernameleft")
                                        .html('<a href="' + userurl + '" target="_blank">' + username + '</a>');
                                    $("#userimage")
                                        .html('<img src="' + userimage + '" class="img-circle">');
                                    $('#postlogin')
                                        .fadeIn('slow');
                                    $('footer, header').fadeIn('slow');
                                });
                            // Create a dropdown list of playlists and apply select box styling
                            $("#choosebox").html('<select id="playlistchooser"><option>...</option></select>');
                            $("#playlistname").html('<span id="noplaylist">No selection</span>');
                            $("#playlistname").fadeIn();
                            $("#playlistchooser").selectmenu({change: function( event, ui ) {dropdownselect();}});

                            // Show the users playlists
                            var selection = document.getElementById("playlistchooser");
                            var options = plist;
                            for (var i = 0; i < options.length; i++) {
                                var opt = options[i];
                                var el = document.createElement("option");
                                el.textContent = opt;
                                el.value = opt;
                                selection.appendChild(el);
                            }
                        }

                    });
                });
        });
    });

})();

// Get the ID from the playlist name and lookup the playlist info
function chosenlookup() {
    playlistid = '';
    $.each(plistarray, function (i, v) {
        var upperv = v.name;
        if (upperv == selectedlist) {
            playlistid = v.id;
            // Set the HTML element playlist title and truncate it if it's too long, also display the copy and print links
            $("#playlistname").html(selectedlist);
            $('#playlistname').succinct({size: 70});
            $("#noplaylist").hide();
        }
    });

        $.ajax({
        url: 'https://api.spotify.com/v1/users/' + globaluser + '/playlists/' + playlistid + '/tracks',
        headers: {
            'Authorization': 'Bearer ' + globaltoken
        },
        dataType: 'json',
        success: function (data) {
            // Make sure track array is blank when changing playlists
            var trackarray = [];
            // Set the total track count

                            // For each track, put artist and title into an array
                            for (var index in data.items) {
                                // Get track artist and title
                                var artistreturn = data.items[index].track.artists[0].name;
                                var trackreturn = data.items[index].track.name;
                                var trackarrayreturn = {
                                    artist: artistreturn,
                                    title: trackreturn
                                };
                                trackarray.push(trackarrayreturn);
                            }
                            tracklist = [];
                            // Set a global var
                            globaltracklist = tracklist;
                            // Update the HTML elements with the track array
                            for (var index in trackarray) {
                            var playlisttracks = trackarray[index].artist + ' - ' + trackarray[index].title+'<br>';
                            tracklist.push(playlisttracks);
                            }
                            $('#textlist').slideToggle('slow',function() {
                            $('#textlist').css('height','auto');
                            $('#textlist').html(tracklist);
                            $('#textlist').slideToggle('slow');
                             });
        },
        error: function(error) {
            console.log(error);
        }
    });
}

// Return the page to normal if no playlist select after already making a selection
function noselection(){
    $("#playlistname").html('<span id="noplaylist">No selection</span>');
    $('#textlist').slideToggle('slow',function() {
    $("#textlist").css('height','300px');
    $("#textlist").html('<div id="listplaceholder">Your track listing will appear here once you\'ve chosen a playlist.</div>');
    $('#textlist').slideToggle('slow');
    });
}

// Function to print out the playlist
function printout(){
$("#textlist").printThis({
       pageTitle: selectedlist,
       importCSS: false
});
}

// @TODO - Use MVC.

// Instantiate the default params
var self = this;
var results_count = 0;

var google_accs = 0;
var dropbox_accs = 0;
var box_accs = 0;

var google_open_entries = 0;
var dropbox_open_entries = 0;
var box_open_entries = 0;

var google_accs_array = [];
var dropbox_accs_array = [];
var box_accs_array = [];

var google_is_active = false;
var dropbox_is_active = false;
var box_is_active = false;

var MAX_G_ACCOUNTS = 3;
var MAX_DB_ACCOUNTS = 1;
var MAX_B_ACCOUNTS = 1;
var SERVER_URL = 'http://localhost';
var SERVER_PORT = 5000;

//
// Simple handlers for page defined actions.
//
$(document).ready(function () {

    // Prevent users from submitting forms with "enter"
    // Ref: https://stackoverflow.com/questions/895171/prevent-users-from-submitting-a-form-by-hitting-enter
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    // Submit the search
    $( "#search-button" ).click(function() {
        console.log("Submitting a search");

        var anchor = $('.google-results-anchor');
        var search = $( "#search-bar-input" )[0].value;

        clearResults();

        // If the search bar is empty, do nothing
        if (search === '') {
            console.log("Cannot submit an empty search");
            return;
        }

        // Only search enabled accounts
        if (google_is_active) {
            // Search each account
            for (var i = 0; i < google_accs_array.length; i++) {
                var google_account = google_accs_array[i];
                console.log("Submitting search: " + search + " on account: " + google_account);

                var google_files_url = SERVER_URL + ':' + SERVER_PORT + "/google/get_files?";
                var google_mail_url = SERVER_URL + ':' + SERVER_PORT + "/google/get_mail?";
                google_files_url += $.param({email: google_account, keyword: search});
                google_mail_url += $.param({email: google_account, keyword: search});

                // Create the file request
                var google_file_request = {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                };

                // Create the mail request
                var google_mail_request = {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                };

                // Fetch the files
                fetch(google_files_url, google_file_request)
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log('Error searching a Google account for files: ' + response.status);
                                return;
                            }
                            
                            console.log("Successfully searched a Google account for files");
                            
                            response.json().then(function(data) {
                                // Display the data
                                var platform = data.platform;
                                var account = data.account;
                                var storage = data.storage;
                            
                                results_count += data.data.length;

                                for (var i = 0; i < data.data.length; i++) {

                                    var result_html = ' <div class="results-entry-container" id="google-files-results-entry-' + i + '">' +
                                                      '     <hr/>' +
                                                      '     <div class="results-entry-header">' +
                                                      '         <div><span class="results-header">Found on: </span><span>' + storage + ' ' + platform + '</span></div>' +
                                                      '         <div><span class="results-header">Owner: </span><span>' + account + '</span></div>' +
                                                      '     </div>' +
                                                      '     <div class="results-entry">' +
                                                      '         <a class="results-entry-link" target="_blank" href="' + data.data[i].webViewLink + '"><div class="results-entry-name">' + data.data[i].name + '</div></a>' +
                                                      '     </div>' +
                                                      '     <hr/>' +
                                                      ' </div>';

                                    // Display a new results div
                                    anchor.append(result_html);
                                }

                                updateResultsCount();

                            });
                        }
                    )
                    .catch(function(err) {
                        console.log('Error fetching from ' + google_files_url + ': ' + err);
                    });

                // Fetch the mail
                fetch(google_mail_url, google_mail_request)
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log('Error searching a Google account for mail: ' + response.status);
                                return;
                            }
                            
                            console.log("Successfully searched a Google account for mail");

                            response.json().then(function(data) {
                                // Display the data
                                var platform = data.platform;
                                var account = data.account;
                                var storage = data.storage;

                                results_count += data.data.length;

                                for (var i = 0; i < data.data.length; i++) {
                                    var result_html = ' <div class="results-entry-container" id="google-mail-results-entry-' + i + '">' +
                                                      '     <hr/>' +
                                                      '     <div class="results-entry-header">' +
                                                      '         <div><span class="results-header">Found on: </span><span>' + storage + ' ' + platform + '</span></div>' +
                                                      '         <div><span class="results-header">Owner: </span><span>' + account + '</span></div>' +
                                                      '     </div>' +
                                                      '     <div class="results-entry">' +
                                                      '     </div>' +
                                                      '         <div><span class="results-header">Subject: </span><span>' + data.data[i].header.subject + '</span></div>' +
                                                      '         <div><span class="results-header">From: </span><span>' + data.data[i].header.from + '</span></div>';

                                    if (data.data[i].header.snippet) {
                                        result_html += '         <div><span class="results-header">Snippet: </span><span>' + data.data[i].header.snippet + '</span></div>';
                                    }

                                    if (data.data[i].body) {
                                        result_html += '     <div class="google-results-email">' + data.data[i].body + '</div>';
                                    }
                                    
                                    result_html += '     <hr/>';
                                    result_html += ' </div>';

                                    // Display a new results div
                                    anchor.append(result_html);
                                }

                                updateResultsCount();

                            });
                        }
                    )
                    .catch(function(err) {
                        console.log('Error fetching from ' + google_mail_url + ': ' + err);
                    });

            }
        }

        if (box_is_active) {
            // @TODO - Account is hardcoded at the moment

            var box_url = SERVER_URL + ':' + SERVER_PORT + "/box/get_files?";
            box_url += $.param({keyword: search});

            // Create the file request
            var box_file_request = {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
            };

            // Fetch the files
            fetch(box_url, box_file_request)
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log('Error searching a Box account for files: ' + response.status);
                            return;
                        }
                        
                        console.log("Successfully searched a Box account for files");
                        
                        response.json().then(function(data) {
                            // Display the data
                            var account = data.account;
                            var storage = data.storage;
                        
                            results_count += data.data.length;

                            for (var i = 0; i < data.data.length; i++) {

                                var result_html = ' <div class="results-entry-container" id="google-files-results-entry-' + i + '">' +
                                                  '     <hr/>' +
                                                  '     <div class="results-entry-header">' +
                                                  '         <div><span class="results-header">Found on: </span><span>' + storage + '</span></div>' +
                                                  '         <div><span class="results-header">Owner: </span><span>' + account + '</span></div>' +
                                                  '     </div>' +
                                                  '     <div class="results-entry">' +
                                                  '         <span class="results-header">Download: </span><a class="results-entry-link" target="_blank" href="' + data.data[i].url + '"><span class="results-entry-name">' + data.data[i].name + '</span></a>' +
                                                  '     </div>' +
                                                  '     <hr/>' +
                                                  ' </div>';

                                // Display a new results div
                                anchor.append(result_html);
                            }

                            updateResultsCount();

                        });
                    }
                )
                .catch(function(err) {
                    console.log('Error fetching from ' + box_url + ': ' + err);
                });

        }

        if (dropbox_is_active) {
            // @TODO - Account is hardcoded at the moment

            var dropbox_url = SERVER_URL + ':' + SERVER_PORT + "/dropbox/get_files?";
            dropbox_url += $.param({keyword: search});

            // Create the file request
            var dropbox_file_request = {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
            };

            // Fetch the files
            fetch(dropbox_url, dropbox_file_request)
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log('Error searching a Dropbox account for files: ' + response.status);
                            return;
                        }
                        
                        console.log("Successfully searched a Dropbox account for files");
                        
                        response.json().then(function(data) {
                            // Display the data
                            var account = data.account;
                            var storage = data.storage;
                        
                            results_count += data.data.length;

                            for (var i = 0; i < data.data.length; i++) {

                                var result_html = ' <div class="results-entry-container" id="google-files-results-entry-' + i + '">' +
                                                  '     <hr/>' +
                                                  '     <div class="results-entry-header">' +
                                                  '         <div><span class="results-header">Found on: </span><span>' + storage + '</span></div>' +
                                                  '         <div><span class="results-header">Owner: </span><span>' + account + '</span></div>' +
                                                  '     </div>' +
                                                  '     <div class="results-entry">' +
                                                  '         <span class="results-header">Download: </span><a class="results-entry-link" target="_blank" href="' + data.data[i].url + '"><span class="results-entry-name">' + data.data[i].name + '</span></a>' +
                                                  '     </div>' +
                                                  '     <hr/>' +
                                                  ' </div>';

                                // Display a new results div
                                anchor.append(result_html);
                            }

                            updateResultsCount();

                        });
                    }
                )
                .catch(function(err) {
                    console.log('Error fetching from ' + dropbox_url + ': ' + err);
                });

        }

    });

    // Clear the results list
    $( "#results-button" ).click(clearAll);

    // Show the Login menu
    $( "#settings-button" ).click(function() {
        document.getElementById("login-nav").style.width = "250px";
        $("#login-nav").css('box-shadow', '10px 6px 70px 3px rgba(0,0,0,0.76)');
    });

    // Close the Login menu
    $( "#login-exit-button" ).click(function() {
        document.getElementById("login-nav").style.width = "0px";
    });

    // Toggle Google access
    $( "#google-button" ).click(function() {
        var is_active = $('#google-button').attr('class').includes('active') ? true : false;
        if (is_active) {
            console.log("Disabling Google access");
            document.getElementById("google-button").setAttribute("aria-expanded", "false");
            $('#google-button').removeClass('active');
            google_is_active = false;
        } else {
            console.log("Enabling Google access");
            document.getElementById("google-button").setAttribute("aria-expanded", "true");
            $('#google-button').addClass('active');
            google_is_active = true;
        }
    });

    // Toggle Box access
    $( "#box-button" ).click(function() {
        var is_active = $('#box-button').attr('class').includes('active') ? true : false;
        if (is_active) {
            console.log("Disabling Box access");
            document.getElementById("box-button").setAttribute("aria-expanded", "false");
            $('#box-button').removeClass('active');
            box_is_active = false;
        } else {
            console.log("Enabling Box access");
            document.getElementById("box-button").setAttribute("aria-expanded", "true");
            $('#box-button').addClass('active');
            box_is_active = true;
        }
    });

    // Toggle Dropbox access
    $( "#dropbox-button" ).click(function() {
        var is_active = $('#dropbox-button').attr('class').includes('active') ? true : false;
        if (is_active) {
            console.log("Disabling Dropbox access");
            document.getElementById("dropbox-button").setAttribute("aria-expanded", "false");
            $('#dropbox-button').removeClass('active');
            dropbox_is_active = false;
        } else {
            console.log("Enabling Dropbox access");
            document.getElementById("dropbox-button").setAttribute("aria-expanded", "true");
            $('#dropbox-button').addClass('active');
            dropbox_is_active = true;
        }
    });

    // Add Google account
    $( "#login-add-google-button" ).click(function() {
        console.log("Adding a Google account");

        var anchor = $( "#google-accounts-anchor" );

        if (google_open_entries < MAX_G_ACCOUNTS) {
            // Define HTML
            var login_html = ' <form id="google-form-' + google_accs + '">' +
                         '     <div class="form-row email-form">' +
                         '         <a href="javascript:void(0)" class="col-sm-1 login-nav-btn remove-button" id="google-remove-button-' + google_accs + '">&minus;</a>' +
                         '         <input type="text" class="col-sm-7 form-control email-form-input" id="google-email-' + google_accs + '" placeholder="Email">' +
                         '         <button type="button" class="col-sm-3 btn btn-sm link-btn" id="google-link-button-' + google_accs + '">link</button>' +
                         '     </div>' +
                         ' </form>';

            // Display a new email input
            anchor.append(login_html);
            document.getElementById('google-link-button-' + google_accs).addEventListener("click", linkGoogleAccount, false);
            document.getElementById('google-remove-button-' + google_accs).addEventListener("click", removeGoogleAccount, false);
            google_open_entries++;
            google_accs++;
        }
                     
    });

    // Add Box account
    $( "#login-add-box-button" ).click(function() {
        console.log("Adding an Box account");
        
        var anchor = $( "#box-accounts-anchor" );

        if (box_open_entries < MAX_B_ACCOUNTS) {
            // Define HTML
            var login_html = ' <form id="box-form-' + box_accs + '">' +
                         '     <div class="form-row email-form">' +
                         '         <a href="javascript:void(0)" class="col-sm-1 login-nav-btn remove-button" id="box-remove-button-' + box_accs + '">&minus;</a>' +
                         '         <input type="text" class="col-sm-7 form-control email-form-input" id="box-email-' + box_accs + '" placeholder="conorc273@gmail.com" disabled>' +
                         '         <button type="button" class="col-sm-3 btn btn-sm link-btn" id="box-link-button-' + box_accs + '"disabled>linked</button>' +
                         '     </div>' +
                         ' </form>';

            // Display a new email input
            anchor.append(login_html);
            document.getElementById('box-link-button-' + box_accs).addEventListener("click", linkBoxAccount, false);
            document.getElementById('box-remove-button-' + box_accs).addEventListener("click", removeBoxAccount, false);
            box_open_entries++;
            box_accs++;
        }
    
    });

    // Add Dropbox account
    $( "#login-add-dropbox-button" ).click(function() {
        console.log("Adding a Dropbox account");
        
        var anchor = $( "#dropbox-accounts-anchor" );

        if (dropbox_open_entries < MAX_DB_ACCOUNTS) {
            // Define HTML
            var login_html = ' <form id="dropbox-form-' + dropbox_accs + '">' +
                         '     <div class="form-row email-form">' +
                         '         <a href="javascript:void(0)" class="col-sm-1 login-nav-btn remove-button" id="dropbox-remove-button-' + dropbox_accs + '">&minus;</a>' +
                         '         <input type="text" class="col-sm-7 form-control email-form-input" id="dropbox-email-' + dropbox_accs + '" placeholder="conorc273@gmail.com" disabled>' +
                         '         <button type="button" class="col-sm-3 btn btn-sm link-btn" id="dropbox-link-button-' + dropbox_accs + '" disabled>linked</button>' +
                         '     </div>' +
                         ' </form>';

            // Display a new email input
            anchor.append(login_html);
            document.getElementById('dropbox-link-button-' + dropbox_accs).addEventListener("click", linkDropboxAccount, false);
            document.getElementById('dropbox-remove-button-' + dropbox_accs).addEventListener("click", removeDropboxAccount, false);
            dropbox_open_entries++;
            dropbox_accs++;
        }

    });

    // Remove Google account
    function removeGoogleAccount(event) {
        console.log("Removing a Google account");

        var url = SERVER_URL + ':' + SERVER_PORT + "/google/remove_account";

        // Get the ID of the input field
        var input_id = event.target.attributes[2].nodeValue.split('-').pop();

        // Get the input from the input field
        var email = $( '#google-email-' + input_id ).val();

        // Get the element to delete
        var form_el = $( '#google-form-' + input_id );

        // Check if the account is linked
        var link_button_text = $( '#google-link-button-' + input_id ).text();

        // If the account is not linked, we can simply delete the element
        if (link_button_text !== 'linked') {
            google_open_entries--;
            form_el.remove();
            return;
        }

        // Create the request
        var request = {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email})
        };

        fetch(url, request)
            .then(
                function(response) {
                    if (response.status !== 200) {
                        console.log('Error removing a Google account: ' + response.status);
                        return;
                    }
                    console.log("Successfully removed a Google account");
                    
                    // Remove email from the list of known Google accounts
                    if ($.inArray(email, google_accs_array) !== -1) {
                        google_accs_array.splice( google_accs_array.indexOf(email), 1 );
                        google_open_entries--;
                    }

                    // Delete the element
                    form_el.remove();
                }
            )
            .catch(function(err) {
                console.log('Error fetching from ' + url + ': ' + err);
            });

    }

    // Remove Box account entry
    function removeBoxAccount() {
        console.log("Removing an Box account");
    }

    // Remove Dropbox account entry
    function removeDropboxAccount() {
        console.log("Removing a Dropbox account");
    }

    // Link Google account
    function linkGoogleAccount(event) {
        console.log("Linking a Google account");

        var url = SERVER_URL + ':' + SERVER_PORT + "/google/add_account";

        // Get the ID of the input field
        var input_id = event.target.attributes[2].nodeValue.split('-').pop();

        // Get the input from the input field
        var email = $( '#google-email-' + input_id ).val();

        // Don't do anything if input field is empty
        if (email === '') {
            console.log("Cannot link a Google account without an email");
            return;
        }

        // Validate the email
        if (!validEmail(email)) {
            console.log("Email format is invalid. Cannot link the Google account");
            return;
        }

        // Create the request
        var request = {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email})
        };

        fetch(url, request)
            .then(
                function(response) {
                    if (response.status !== 200) {
                        console.log('Error linking a Google account: ' + response.status);
                        return;
                    }
                    console.log("Successfully linked a Google account");
                    
                    // Add email to the list of known Google accounts
                    if ($.inArray(email, google_accs_array) == -1) {
                        google_accs_array.push(email);
                    }

                    // Update the "LINK" button and input field
                    $( '#google-email-' + input_id ).prop('disabled', true);
                    $( '#google-link-button-' + input_id ).prop('disabled', true);
                    $( '#google-link-button-' + input_id ).text('linked');
                }
            )
            .catch(function(err) {
                console.log('Error fetching from ' + url + ': ' + err);
            });
    }

    // Link Box account
    function linkBoxAccount() {
        console.log("Linking an Box account");
    }

    // Link Dropbox account
    function linkDropboxAccount() {
        console.log("Linking a Dropbox account");
    }

    //  Trivially validates an email entry
    function validEmail(email) {
        return (email.indexOf('@') > -1);
    }

    // Update the results count
    function updateResultsCount() {
        $( "#results-count-badge" ).text(results_count);
    }

    // Remove all results
    function clearResults() {
        console.log("Clearing the search results");

        // Remove all results
        $( ".google-results-anchor" ).empty();
        $( ".box-results-anchor" ).empty();
        $( ".dropbox-results-anchor" ).empty();

        // Update the results count
        $( "#results-count-badge" ).text('0');

        results_count = 0;
    }

    // Remove all results and clear the search bar
    function clearAll() {
        console.log("Clearing the search results");

        // Remove all results
        $( ".google-results-anchor" ).empty();
        $( ".box-results-anchor" ).empty();
        $( ".dropbox-results-anchor" ).empty();

        // Clear the search bar
        $( "#search-bar-input" )[0].value = '';

        // Update the results count
        $( "#results-count-badge" ).text('0');

        results_count = 0;
    }

});

/* Global Variables */

// Personal API Key for OpenWeatherMap API
const baseUrl = 'http://api.openweathermap.org/data/2.5/weather?'
const API_KEY = '74dacb374db8443097dc29f128591341';
let measurement = ''
let country = '';
let zip = '';
errCode = '';


/* Main Function*/

document.addEventListener('DOMContentLoaded', () => {
    // A function for adding countries from countries.js as selectable options

    function addCountries() {
        const selector = document.getElementById('countriesSelect')
        const fragment = document.createDocumentFragment();

        for (ctry of countryData) {
            let option = document.createElement('option');
            option.setAttribute('value', (ctry.code).toLowerCase());
            option.textContent = ctry.name;
            fragment.appendChild(option);
        }
        selector.appendChild(fragment);
    }

    addCountries();

    const btn = document.getElementById('generate')
    btn.preventDefault;

    // Create a new date instance dynamically with JS

    function getDate() {
        let d = new Date();
        let newDate = `${(d.getMonth() + 1)}.${d.getDate()}.${d.getFullYear()} - ${d.getHours() + 1}:${d.getMinutes() + 1}:${d.getSeconds() + 1}`;
        return newDate;
    }

    // Event listener to add function to existing HTML DOM element

    btn.addEventListener('click', function requestStarter() {

        // Get the Selected country and set it to the global variable 'country'
        country = document.querySelector('select').value;

        // Function for getting selected options and warning the user if some required options are missing/not selected

        function getAPIService() {
            let rbValidated = false;
            let zipValidated = false;

            // Get the desired measurment value
            function getRbValue() {
                const rbs = document.querySelectorAll('input[type=radio]')

                for (const rb of rbs) {
                    if (rb.checked) {
                        rbValidated = true
                        measurement = rb.value;
                    }
                }
                if (rbValidated === false) {
                    alert('Please select a valid measurment value');
                }
            }

            // Get the value of the typed zip code

            function getZipValue() {
                const zipElement = document.querySelector('#zip')

                if (zipElement.value.length > 0) {
                    zip = zipElement.value;
                    zipValidated = true;
                } else {
                    alert('Please type a zip code.');
                }
            }

            // Get the user feelings

            function getFeelings() {
                const feelings = document.querySelector('#feelings').value;
                return feelings;
            }
            getRbValue();
            getZipValue();
            getFeelings();

            /* GET , POST & UI update Functions*/

            // Function to GET the weather data from the weather API
            async function getWeather(baseURL, appid, zipNum, countryCode, units) {
                const request = await fetch(`${baseURL}zip=${zipNum},${countryCode}&appid=${appid}&units=${units}`);
                try {
                    const data = await request.json();
                    return data;
                } catch (e) {
                    console.log('error', e);
                }

            }

            // Function to POST data to server.js
            async function postData(url = '', data = {}) {
                const response = await fetch(url, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                try {
                    const newData = await response.json();
                } catch (e) {
                    console.log('error', e);
                }
            }

            // Function to GET the required data for the UI from the server
            async function getDataForUser(url = '') {
                const request = await fetch(url);
                try {
                    const userData = await request.json();
                    return userData;
                } catch (e) {
                    console.log('error', e);
                }
            }

            //Function for updating the UI dynamically according to the server data
            function updateUi(uiData) {

                const dateDiv = document.querySelector('#date');
                const tempDiv = document.querySelector('#temp');
                const contentDiv = document.querySelector('#content');

                dateDiv.innerHTML = `Date: ${uiData.date}`;
                tempDiv.innerHTML = `Temperature: ${uiData.temperature} ${(measurement === 'metric') ? `\xB0C` : (measurement === 'imperial') ? `\xB0F` : `\xB0K`}`;
                contentDiv.innerHTML = (uiData.userResponse != '') ? `User input: ${uiData.userResponse}` : '';
            }

            // Starts the GET request if all data is received from the user

            if (rbValidated === true && zipValidated === true) {
                // Gets all data from API and posts it to server.js
                getWeather(baseUrl, API_KEY, zip, country, measurement).then((data) => {
                    //Checks if the API returned valid data or not and alerts the user
                    if (data.cod === '400' || data.cod === '404') {
                        errCode = (data.cod);
                        if (errCode === '404') {
                            alert(`This city's data is not available in the database`)
                        } else {
                            alert(`The ZIP code you entered is invalid, Please enter another zip code`);
                        }
                    } else {
                        errCode = '';
                        // Posts the data retrieved from the API to the server as well as the user input
                        postData('/saveData', { 'data': data, 'userInput': getFeelings(), 'date': getDate() })
                    }
                }).then(() => {
                    if (errCode !== '400' && errCode !== '404') {
                        // Get the data from the server and send it to the UI updater function if no errors occur
                        getDataForUser('/dataForUser').then((uiData) => {
                            updateUi(uiData);
                        })
                    }
                })
            }
        }
        getAPIService();
    })
})

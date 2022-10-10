function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function testStorage(methodString) {
    let result = document.getElementById("test-caching");
    if (storageAvailable(methodString)) {
        
        // Yippee! We can use localStorage awesomeness
        // Save data to sessionStorage
        sessionStorage.setItem("lw_name", "marcus");

        // Get saved data from sessionStorage
        let data = sessionStorage.getItem("lw_name");

        // alert(methodString +' says my name is ' + data);
        // Remove saved data from sessionStorage
        sessionStorage.removeItem("lw_name");
        result.innerHTML = "Test: " + methodString + " is enabled."
    }
    else {
        // Too bad, no localStorage for us
        // alert(methodString + ' says Web Storage API is disabled.');
        result.innerHTML = "Test: " + methodString + ' says Web Storage API is disabled.';
    }
}



testStorage('sessionStorage');
testStorage('localStorage');
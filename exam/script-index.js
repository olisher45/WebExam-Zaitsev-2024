'use strict';
const API_KEY = "4d695ee6-4b30-4958-abaa-ce363de76996";
let routes = [];
let guides = [];
let filteredRoutes = [];
let filteredGuides = [];
let selectedRouteIndex = -1;
let selectedGuideIndex = -1;
const routesPerPage = 10;
const guidesPerPage = 100;
let currentPage = 1;
let currentPageGuides = 1;
let tooltipTriggerList;
let tooltipList;

function showNotification(message, className) {
    const notificationElement = document.getElementById("notification");
    notificationElement.classList.remove("alert-success", "alert-danger");
    notificationElement.classList.add(className);
    notificationElement.innerHTML = `Уведомление: ${message}`;
    notificationElement.classList.remove("d-none");
    setTimeout(function() {
        notificationElement.classList.add("d-none");
    }, 5000);
}


function disposeTooltips() {
    if (tooltipList) {
        tooltipList.forEach(tooltip => tooltip.dispose());
    }
}

function initializeTooltips() {
    disposeTooltips();
    tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]');
    tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function getYearForm(number) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'лет';
    }

    switch (lastDigit) {
    case 1:
        return 'год';
    case 2:
    case 3:
    case 4:
        return 'года';
    default:
        return 'лет';
    }
}


function loadObjectsGuides() {
    let objects = [];
    filteredGuides.forEach(guide => {
        const language = guide.language;
        objects = [...new Set([...objects, language])];
    });
    const selectObjects = document.getElementById('selectLanguages');
    selectObjects.innerHTML = '<option value="">Все языки</option>';
    objects.forEach(obj => {
        selectObjects.innerHTML += `<option value="${obj}">${obj}</option>`;
    });
}

function processGuides(guides) {
    const tbody = document.getElementById('guides');
    let table = '';
    const startIndex = (currentPageGuides - 1) * guidesPerPage;
    const endIndex = startIndex + guidesPerPage;
    const currentGuides = guides.slice(startIndex, endIndex);
    currentGuides.forEach((guide, index) => {
        const absoluteIndex = startIndex + index;
        const truncatedName = guide.name.length > 30 ? 
            guide.name.substring(0, 30) + '...' : guide.name;
        const truncatedLanguages = guide.language.length > 100 ? 
            guide.language.substring(0, 100) + '...' : guide.language;
        const row = `
            <tr 
            class="${absoluteIndex === selectedGuideIndex ? 
        'table-success' : ''}">
                <td data-bs-toggle="tooltip" data-bs-placement="top" 
                title="${guide.name}" class="" width=5%>
                <img src="src\\avatar-person.svg" alt="${guide.name}"></td>
                <td data-bs-toggle="tooltip" 
                data-bs-placement="top" title="${guide.name}" 
                class="text-truncate text-wrap">${truncatedName}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" 
                title="${guide.language}" class="text-truncate 
                text-wrap">${truncatedLanguages}</td>
                <td>${guide.workExperience + " " + 
                getYearForm(parseInt(guide.workExperience, 10))}</td>
                <td>${guide.pricePerHour + " " + "руб."}</td>
                <td width=5%><button 
                class="btn btn-dark" 
                onclick="selectGuide(${absoluteIndex})">Выбрать</button></td>
            </tr>
        `;
        table += row;
        
    });
    tbody.innerHTML = table;
    initializeTooltips();
}

function applyFilterGuides() {
    const elementsToRemove = document.querySelectorAll('.tooltip.inner');
    elementsToRemove.forEach(element => {
        element.remove();
    });
    document.getElementById("submit").classList.add("d-none");
    const languageInputValue = document.getElementById(
        'selectLanguages').value.toLowerCase();
    const experienceFrom = document.getElementById('experienceFrom').value;
    const experienceTo = document.getElementById('experienceTo').value;

    filteredGuides = guides.filter(guide => {
        const languageMatches = languageInputValue === '' ||
         guide.language.toLowerCase().includes(languageInputValue);
        const experienceFromMatches = experienceFrom === '' || 
        parseInt(guide.workExperience, 10) >= parseInt(experienceFrom, 10);
        const experienceToMatches = experienceTo === '' || 
        parseInt(guide.workExperience, 10) <= parseInt(experienceTo, 10);

        return languageMatches && experienceFromMatches && experienceToMatches;
    });

    processGuides(filteredGuides);
}

async function loadGuides() {
    let routeID = routes[selectedRouteIndex].id;
    let url = new URL(
        `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/`
        + `routes/${routeID}/guides`);
    url.searchParams.set("api_key", API_KEY);
    let response = await fetch(url);
    if (response.ok) {
        guides = await response.json();
        applyFilterGuides();
        loadObjectsGuides();
    } else {
        showNotification(
            "Ошибка при получении списка гидов.", "alert-danger");
    }
    
}


function processRoutes(routes) {
    const tbody = document.getElementById('routes');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * routesPerPage;
    const endIndex = startIndex + routesPerPage;
    const currentRoutes = routes.slice(startIndex, endIndex);

    currentRoutes.forEach((route, index) => {
        const absoluteIndex = startIndex + index;
        const truncatedName = route.name.length > 30 ? 
            route.name.substring(0, 30) + '...' : route.name;
        const truncatedDescription = route.description.length > 100 ? 
            route.description.substring(0, 100) + '...' : route.description;
        const truncatedMainObject = route.mainObject.length > 100 ? 
            route.mainObject.substring(0, 100) + '...' : route.mainObject;
        const row = `
            <tr class="${absoluteIndex === selectedRouteIndex ? 
        'table-success' : ''}">
                <td data-bs-toggle="tooltip" data-bs-placement="top" 
                title="${route.name}" 
                class="text-truncate text-wrap">${truncatedName}</td>
                <td data-bs-toggle="tooltip" 
                data-bs-placement="top" title="${route.description}" 
                class="text-truncate text-wrap">${truncatedDescription}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" 
                title="${route.mainObject}" 
                class="text-truncate text-wrap">${truncatedMainObject}</td>
                <td><button class="btn btn-dark" 
                onclick="selectRoute(${absoluteIndex})">Выбрать</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    initializeTooltips();
}

function applyFilterRoutes() {
    if (selectedRouteIndex == -1) {
        document.getElementById("guidesTableContainer").classList.add("d-none");
    } else {
        loadGuides();
        let routeName = routes[selectedRouteIndex].name;
        document.getElementById(
            "guidesTitle").innerHTML = 
            `Доступные гиды по маршруту ${routeName}`;
        document.getElementById(
            "guidesTableContainer").classList.remove("d-none");
    }
    document.getElementById("submit").classList.add("d-none");
    const searchInputValue = document.getElementById(
        'searchInput').value.toLowerCase();
    const selectObjectsValue = document.getElementById(
        'selectObjects').value.toLowerCase();

    filteredRoutes = routes.filter(route => {
        const nameMatches = route.name.toLowerCase().includes(searchInputValue);
        const objectMatches = selectObjectsValue === '' || 
        route.mainObject.toLowerCase().includes(selectObjectsValue);
        return nameMatches && objectMatches;
    });
    updatePaginationRoutes();
    //Функции вызывают друг друга с условием, исключащем бесконечный цикл
    processRoutes(filteredRoutes);

    const tbody = document.getElementById('guides');
    tbody.innerHTML = '';
}

function updatePaginationRoutes() {
    const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);
    const paginationElement = document.getElementById('paginationRoutes');
    paginationElement.innerHTML = '';
    if (currentPage > totalPages) {
        currentPage = 1;
    }

    const prevButton = document.createElement('li');
    prevButton.classList.add('page-item');
    if (currentPage === 1) {
        prevButton.classList.add('disabled');
    }
    const prevLink = document.createElement('a');
    prevLink.classList.add('page-link');
    prevLink.href = '#routesSection';
    prevLink.innerHTML = '&laquo;';
    prevLink.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            applyFilterRoutes();
            updatePaginationRoutes();
        }
    });
    prevButton.appendChild(prevLink);
    paginationElement.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');

        const a = document.createElement('a');
        if (i === currentPage) {
            a.classList.add('active-nav');
        }
        a.classList.add('page-link');
        a.href = "#routesSection";
        a.textContent = i;
        a.addEventListener('click', () => {
            currentPage = i;
            applyFilterRoutes();
            updatePaginationRoutes();
        });
        li.appendChild(a);
        paginationElement.appendChild(li);
    }

    const nextButton = document.createElement('li');
    nextButton.classList.add('page-item');
    if (currentPage === totalPages) {
        nextButton.classList.add('disabled');
    }
    const nextLink = document.createElement('a');
    nextLink.classList.add('page-link');
    nextLink.href = '#routesSection';
    nextLink.innerHTML = '&raquo;';
    nextLink.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            applyFilterRoutes();
            updatePaginationRoutes();
        }
    });
    nextButton.appendChild(nextLink);
    paginationElement.appendChild(nextButton);
}

document.addEventListener('DOMContentLoaded', function () {
    tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]');
    tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});

const generateHourOptions = () => {
    const hours = [];
    for (let i = 9; i <= 23; i++) {
        hours.push(i);
    }
    return hours;
};

const generateMinuteOptions = () => {
    const minutes = [0, 30];
    return minutes;
};

const startHourSelect = document.getElementById('startHour');
const startMinuteSelect = document.getElementById('startMinute');

const hourOptions = generateHourOptions();
const minuteOptions = generateMinuteOptions();

hourOptions.forEach(hour => {
    const optionElement = document.createElement('option');
    optionElement.value = hour;
    optionElement.text = hour.toString().padStart(2, '0');
    startHourSelect.add(optionElement);
});

minuteOptions.forEach(minute => {
    const optionElement = document.createElement('option');
    optionElement.value = minute;
    optionElement.text = minute.toString().padStart(2, '0');
    startMinuteSelect.add(optionElement);
});

function validateTime() {
    const selectedHour = parseInt(startHourSelect.value, 10);
    const selectedMinute = parseInt(startMinuteSelect.value, 10);

    const minTime = new Date('2000-01-01T09:00');
    const maxTime = new Date('2000-01-01T23:00');

    const selectedTime = new Date(
        '2000-01-01T' + selectedHour + ':' + selectedMinute);

    if (selectedTime < minTime || selectedTime > maxTime) {
        alert('Выберите время между 09:00 и 23:00');
        startHourSelect.value = '';
        startMinuteSelect.value = '';
    }
}

startHourSelect.addEventListener('input', validateTime);
startMinuteSelect.addEventListener('input', validateTime);


function loadObjectsRoutes() {
    let objects = [];
    filteredRoutes.forEach(route => {
        const mainObjects = route.mainObject.split('-').map(obj => obj.trim());
        const filteredObjects = mainObjects.filter(
            obj => obj.split(' ').length <= 4);
        objects = [...new Set([...objects, ...filteredObjects])];
    });
    const selectObjects = document.getElementById('selectObjects');
    selectObjects.innerHTML = '<option value="">Все виды объектов</option>';
    objects.forEach(obj => {
        selectObjects.innerHTML += `<option value="${obj}">${obj}</option>`;
    });
}

async function loadRoutes() {
    let url = new URL(
        "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes");
    url.searchParams.set("api_key", API_KEY);
    let response = await fetch(url);
    if (response.ok) {
        routes = await response.json();
        applyFilterRoutes();
        loadObjectsRoutes();
        updatePaginationRoutes();
    } else {
        showNotification(
            "Ошибка при получении списка маршрутов.", "alert-danger");
    }
    
}

function searchRoutes() {
    const searchInput = 
    document.getElementById('searchInput').value.toLowerCase();
    filteredRoutes = 
    routes.filter(route => route.name.toLowerCase().includes(searchInput));
    processRoutes(
        filteredRoutes);
}


function selectRoute(index) {
    selectedRouteIndex = index;
    applyFilterRoutes();
    loadGuides();
    let routeName = routes[selectedRouteIndex].name;
    document.getElementById("guidesTitle").innerHTML = 
    `Доступные гиды по маршруту ${routeName}`;
    document.getElementById("guidesTableContainer").classList.remove("d-none");
}


function selectGuide(index) {
    selectedGuideIndex = index;
    applyFilterGuides();
    document.getElementById("submit").classList.remove("d-none");
}

function fillModalForm() {
    if (selectedRouteIndex !== -1 && selectedGuideIndex !== -1) {
        const selectedRoute = filteredRoutes[selectedRouteIndex];
        const selectedGuide = filteredGuides[selectedGuideIndex];
        const routeNameInput = document.getElementById('routeName');
        const guideNameInput = document.getElementById('guideName');

        routeNameInput.value = selectedRoute.name;
        guideNameInput.value = selectedGuide.name;
    }
}

function isWeekend(day) {
    return day === 0 || day === 6;
}

function isHoliday(date) {
    const holidays = [
        "2024-01-01", "2024-01-02", "2024-01-03", 
        "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-08",
        "2024-01-07", "2024-02-23", "2024-03-08", 
        "2024-05-01", "2024-05-09", "2024-06-12", "2024-11-04"
    ];
    return holidays.includes(date.toISOString().split('T')[0]);
}

function calculateTotalCost() {
    if (selectedRouteIndex !== -1 && selectedGuideIndex !== -1) {
        try {
            const startTime = parseInt(
                document.getElementById('startHour').value, 10);
            const selectedGuide = filteredGuides[selectedGuideIndex];
            const duration = parseInt(
                document.getElementById('duration').value, 10);
            const groupSize = parseInt(
                document.getElementById('groupSize').value, 10);
            const isItMorning = startTime >= 9 && startTime < 12 ? 400 : 0;
            const isItEvening = startTime >= 20 && startTime < 23 ? 1000 : 0;
            const numberOfVisitors = 
            groupSize <= 5 ? 0 : (groupSize <= 10 ? 1000 : 1500);

            const guideServiceCost = selectedGuide.pricePerHour;
            const hoursNumber = duration;

            const selectedDateInput = document.getElementById('excursionDate');
            const selectedDate = new Date(selectedDateInput.value);
            const dayOfWeek = selectedDate.getDay();
            const isDayOff = isWeekend(dayOfWeek) || isHoliday(selectedDate);

            let totalCost = guideServiceCost * 
            hoursNumber * (isDayOff ? 1.5 : 1) + 
            isItMorning + isItEvening + numberOfVisitors;

            const isSeniorDiscount = document.getElementById(
                'seniorDiscount').checked;
            if (isSeniorDiscount) {
                totalCost *= 0.75;
            }

            const isSnackOption = document.getElementById(
                'snackOption').checked;
            if (isSnackOption) {
                const snackCost = 1000 * groupSize;
                totalCost += snackCost;
            }

            document.getElementById('totalCost').value = totalCost;
        } catch (event) {
            console.log(event);
            document.getElementById('totalCost').value = 0;
        }
    }
}


function updateModalForm() {
    fillModalForm();
    calculateTotalCost();
}

function openModal() {
    var modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    document.getElementById("submit").classList.add("d-none");
    updateModalForm();
    modal.show();
}

async function createOrder() {
    try {
        let url = new URL(
            `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders`);
        url.searchParams.set("api_key", API_KEY);

        const formData = new URLSearchParams();
        formData.append("date", document.getElementById("excursionDate").value);
        formData.append("duration", document.getElementById("duration").value);
        formData.append("guide_id", guides[selectedGuideIndex].id);
        formData.append("optionFirst", 
            document.getElementById("seniorDiscount").checked + 0);
        formData.append("optionSecond", 
            document.getElementById("snackOption").checked + 0);
        formData.append("persons", 
            document.getElementById("groupSize").value);
        formData.append("price", 
            Math.floor(document.getElementById("totalCost").value));
        formData.append("route_id", routes[selectedRouteIndex].id);
        formData.append("time", 
            document.getElementById("startHour").value + ":" + 
            document.getElementById("startMinute").value + ":" + "00");

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (response.ok) {
            showNotification(
                "Заявка успешно отправлена.", "alert-success");
        } else {
            showNotification(
                "Ошибка при отправке заявки.", "alert-danger");
        }
    } catch (error) {
        console.error(error);
        showNotification(error, "alert-danger");
    }

}


/////////////////////////////////////////////////////////////////////////

loadRoutes();
document.getElementById(
    'searchInput').addEventListener('input', function () {
    selectedRouteIndex = -1;
    applyFilterRoutes();
    loadObjectsRoutes();
});
document.getElementById(
    'selectObjects').addEventListener('change', function () {
    selectedRouteIndex = -1;
    applyFilterRoutes();
});

document.getElementById(
    'experienceFrom').addEventListener('input', function () {
    selectedGuideIndex = -1;
    applyFilterGuides();
});

document.getElementById('experienceTo').addEventListener('input', function () {
    selectedGuideIndex = -1;
    applyFilterGuides();
});

document.getElementById(
    'selectLanguages').addEventListener('change', function () {
    selectedGuideIndex = -1;
    applyFilterGuides();
});

document.getElementById(
    'excursionDate').addEventListener('change', updateModalForm);
document.getElementById(
    'startHour').addEventListener('change', updateModalForm);
document.getElementById(
    'duration').addEventListener('change', updateModalForm);
document.getElementById(
    'groupSize').addEventListener('input', updateModalForm);
document.getElementById(
    'seniorDiscount').addEventListener('change', updateModalForm);
document.getElementById(
    'snackOption').addEventListener('change', updateModalForm);

document.getElementById(
    'bookingModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById("submit").classList.remove("d-none");
});

document.getElementById('createOrder').addEventListener('click', function() {
    openModal();
});

document.getElementById('submitButton').addEventListener('click', function() {
    createOrder();
});

document.getElementById('seniorDiscount').addEventListener(
    'change', function() {
        updateModalForm();
    });

document.getElementById('snackOption').addEventListener('change', function() {
    updateModalForm();
});